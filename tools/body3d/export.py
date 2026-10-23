# Export Venty's 3D bodies from MakeHuman (MPFB2 in Blender), headless:
#   "C:/Program Files/Blender Foundation/Blender 5.2/blender.exe" -b --python tools/body3d/export.py
#
# For each body (female, male) it:
#   1. creates a young adult MakeHuman base (MPFB2) and bakes the gender/age macros into the basis;
#   2. loads MakeHuman's own "measure" targets (bust, waist, hips, neck, thigh, ...) as shape keys at 0, one shape key
#      per direction (…_incr / …_decr), so the app can push each measurement up or down;
#   3. adds MakeHuman's game-engine skeleton (53 bones, with its skin weights), removes the helper geometry (keeps only the
#      "body" vertex group, every shape key and the bone weights), and swaps the head for a smooth egg (no face, no
#      ears, like a helmet), bound to the head bone;
#   4. measures the body like a tape would (horizontal slices; the torso's own loop; the outline a tape follows, i.e.
#      the convex hull), at weight 0 and with each shape key at 1, so the app knows how many cm each one adds;
#   5. writes public/body3d/<sex>.glb (morph targets, sparse) and src/lib/body3d.json (the measuring model).
# The base mesh and targets are MakeHuman's (CC0). MPFB2 itself (GPL) is only the tool that runs here.
import bpy, bmesh, json, math, os, sys
import numpy as np
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT_GLB = os.path.join(ROOT, "public", "body3d")
OUT_JSON = os.path.join(ROOT, "src", "lib", "body3d.json")

# Venty measure key -> MakeHuman target (without -incr / -decr)
DRIVERS = {
    "bust": "torso/measure-bust-circ",
    "underbust": "torso/measure-underbust-circ",
    "waist": "torso/measure-waist-circ",
    "hips": "torso/measure-hips-circ",
    "napeWaist": "torso/measure-napetowaist-dist",
    "waistHip": "torso/measure-waisttohip-dist",
    "acrossShoulder": "torso/measure-shoulder-dist",
    "acrossFront": "torso/measure-frontchest-dist",
    "neck": "neck/measure-neck-circ",
    "upperArm": "arms/measure-upperarm-circ",
    "wrist": "hands/measure-wrist-circ",
    "thigh": "legs/measure-thigh-circ",
    "upperLeg": "legs/measure-upperleg-height",
    "lowerLeg": "legs/measure-lowerleg-height",
}


def log(*a):
    print("[body3d]", *a)
    sys.stdout.flush()


def target_path(name):
    p = TargetService.target_full_path(name.split("/")[-1])
    if not p:
        raise RuntimeError("missing target " + name)
    return p


def build(sex):
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    macros = TargetService.get_default_macro_info_dict()
    macros["gender"] = 0.0 if sex == "female" else 1.0
    macros["age"] = 0.5          # young adult (about 25)
    macros["race"] = {"asian": 1 / 3, "caucasian": 1 / 3, "african": 1 / 3}
    # the joint helpers stay until the skeleton is fitted to them
    h = HumanService.create_human(mask_helpers=False, detailed_helpers=True, extra_vertex_groups=True,
                                  feet_on_ground=True, scale=0.1, macro_detail_dict=macros)
    bpy.context.view_layer.objects.active = h
    # bake the macros into the basis, so the body's own shape is the rest shape
    TargetService.bake_targets(h)
    rig = HumanService.add_builtin_rig(h, "game_engine", import_weights=True)
    bones = {bn.name for bn in rig.data.bones}
    keys = []
    for key, base in DRIVERS.items():
        for d in ("incr", "decr"):
            name = f"{key}_{d}"
            TargetService.load_target(h, target_path(f"{base}-{d}"), weight=0.0, name=name)
            keys.append(name)

    # the helper geometry goes (the skin, every shape key and the bone weights stay); the head stays for measuring
    me = h.data
    body = h.vertex_groups["body"].index
    bm = bmesh.new()
    bm.from_mesh(me)
    dl = bm.verts.layers.deform.verify()
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if body not in v[dl]], context="VERTS")
    bm.to_mesh(me)
    bm.free()
    for g in list(h.vertex_groups):
        if g.name not in bones:
            h.vertex_groups.remove(g)
    for m in list(h.modifiers):
        if m.type != "ARMATURE":
            h.modifiers.remove(m)
    for poly in me.polygons:
        poly.use_smooth = True

    # feet on the ground: move the skeleton (the meshes ride on it); the tape measures from the same ground
    co = np.empty(len(me.vertices) * 3)
    me.vertices.foreach_get("co", co)
    global ZMIN
    ZMIN = float(co.reshape(-1, 3)[:, 2].min())
    rig.location.z -= ZMIN
    h.name = f"venty_{sex}"
    rig.name = f"venty_{sex}_rig"
    log(sex, "verts", len(me.vertices), "keys", len(keys), "bones", len(bones))
    return h, keys, rig


ZMIN = 0.0


def add_helmet(h, rig, sex):
    """The face and ears go: the head above where the head bone starts is replaced by a smooth egg."""
    # the head, above where the head bone starts: measured for the egg, then removed (face and ears with it)
    head_z = rig.data.bones["head"].head_local.z - 0.04  # the head bone starts at ear level; the chin is lower
    me = h.data
    bm = bmesh.new()
    bm.from_mesh(me)
    head = [v for v in bm.verts if v.co.z > head_z and abs(v.co.x) < 0.2]
    hx = [v.co.x for v in head]; hy = [v.co.y for v in head]; hz = [v.co.z for v in head]
    bmesh.ops.delete(bm, geom=head, context="VERTS")
    bm.to_mesh(me)
    bm.free()

    # the egg: a smooth ovoid a little bigger than the skull (ears included), narrower towards the chin, its lower
    # edge tucked into the neck so the join never shows. Bound wholly to the head bone.
    cx, cy = (max(hx) + min(hx)) / 2, (max(hy) + min(hy)) / 2
    top = max(hz)
    a_ = (max(hx) - min(hx)) / 2 * 1.0
    b_ = (max(hy) - min(hy)) / 2 * 1.04
    c_ = (top - head_z) / 2 * 1.12
    cz = head_z + (top - head_z) / 2 - 0.012
    em = bpy.data.meshes.new(f"venty_{sex}_head")
    ebm = bmesh.new()
    bmesh.ops.create_uvsphere(ebm, u_segments=64, v_segments=40, radius=1.0)
    for v in ebm.verts:
        x, y, z = v.co
        taper = 1.0 - 0.22 * max(0.0, -z) ** 1.4  # narrower at the chin
        v.co = (cx + x * a_ * taper, cy + y * b_ * taper, cz + z * c_)
    ebm.to_mesh(em)
    ebm.free()
    for poly in em.polygons:
        poly.use_smooth = True
    egg = bpy.data.objects.new(f"venty_{sex}_head", em)
    bpy.context.collection.objects.link(egg)
    egg.parent = rig
    vg = egg.vertex_groups.new(name="head")
    vg.add(list(range(len(em.vertices))), 1.0, "REPLACE")
    mod = egg.modifiers.new("Armature", "ARMATURE")
    mod.object = rig

    log(sex, "head cut", round(head_z * 100, 1), "egg", [round(x * 100, 1) for x in (a_, b_, c_)])
    return egg




# ─── the tape: positions of the mesh with some shape keys applied ───
def coords(h, weights):
    kbs = h.data.shape_keys.key_blocks
    n = len(kbs["Basis"].data)
    basis = np.empty(n * 3)
    kbs["Basis"].data.foreach_get("co", basis)
    basis = basis.reshape(-1, 3)
    out = basis.copy()
    out[:, 2] -= ZMIN
    for name, w in weights.items():
        if not w:
            continue
        a = np.empty(n * 3)
        kbs[name].data.foreach_get("co", a)
        out += w * (a.reshape(-1, 3) - basis)
    return out


def edges_of(h):
    """The mesh edges, and for each face the edges around it (so crossing edges of one face can be joined)."""
    me = h.data
    e = np.empty(len(me.edges) * 2, dtype=np.int64)
    me.edges.foreach_get("vertices", e)
    le = np.empty(len(me.loops), dtype=np.int64)
    me.loops.foreach_get("edge_index", le)
    faces = [le[p.loop_start:p.loop_start + p.loop_total] for p in me.polygons]
    return (e.reshape(-1, 2), faces)


def slice_loops(P, EF, z):
    """Points where the mesh's edges cross the plane at height z, grouped into connected loops."""
    E, faces = EF
    a, b = P[E[:, 0]], P[E[:, 1]]
    cross = (a[:, 2] - z) * (b[:, 2] - z) < 0
    idx = np.nonzero(cross)[0]
    if len(idx) == 0:
        return []
    t = (z - a[idx, 2]) / (b[idx, 2] - a[idx, 2])
    pts = a[idx] + (b[idx] - a[idx]) * t[:, None]
    # crossing edges that belong to the same face are neighbours along the loop
    parent = list(range(len(idx)))
    slot = {int(ei): k for k, ei in enumerate(idx)}

    def find(i):
        while parent[i] != i:
            parent[i] = parent[parent[i]]
            i = parent[i]
        return i
    for fe in faces:
        ks = [slot[int(x)] for x in fe if int(x) in slot]
        for k in ks[1:]:
            ra, rb = find(ks[0]), find(k)
            if ra != rb:
                parent[ra] = rb
    groups = {}
    for k in range(len(idx)):
        groups.setdefault(find(k), []).append(k)
    return [pts[g][:, :2] for g in groups.values() if len(g) > 6]


def hull_perimeter(xy):
    pts = sorted(map(tuple, xy))
    if len(pts) < 3:
        return 0.0

    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(hi) >= 2 and cross(hi[-2], hi[-1], p) <= 0:
            hi.pop()
        hi.append(p)
    hull = lo[:-1] + hi[:-1]
    return sum(math.dist(hull[i], hull[(i + 1) % len(hull)]) for i in range(len(hull)))


def torso_circ(P, E, z):
    """The torso's own loop at height z (the one around the middle, not an arm), as a tape follows it."""
    loops = slice_loops(P, E, z)
    best = None
    for L in loops:
        if L[:, 0].min() < 0 < L[:, 0].max():
            w = L[:, 0].max() - L[:, 0].min()
            if best is None or w > best[0]:
                best = (w, L)
    return hull_perimeter(best[1]) * 100 if best else 0.0


def torso_outline(P, E, z, n=64):
    """The outline a tape follows around the torso at height z (its convex hull), resampled to n points, in cm."""
    loops = slice_loops(P, E, z)
    best = None
    for L in loops:
        if L[:, 0].min() < 0 < L[:, 0].max():
            w = L[:, 0].max() - L[:, 0].min()
            if best is None or w > best[0]:
                best = (w, L)
    if not best:
        return []
    pts = sorted(map(tuple, best[1]))
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lo, hi = [], []
    for p in pts:
        while len(lo) >= 2 and cross(lo[-2], lo[-1], p) <= 0:
            lo.pop()
        lo.append(p)
    for p in reversed(pts):
        while len(hi) >= 2 and cross(hi[-2], hi[-1], p) <= 0:
            hi.pop()
        hi.append(p)
    hull = np.array(lo[:-1] + hi[:-1])
    seg = np.linalg.norm(np.roll(hull, -1, axis=0) - hull, axis=1)
    cum = np.concatenate([[0], np.cumsum(seg)])
    out = []
    for t in np.linspace(0, cum[-1], n, endpoint=False):
        i = int(np.searchsorted(cum, t, side="right") - 1)
        f = (t - cum[i]) / max(seg[i], 1e-9)
        q = hull[i] + (hull[(i + 1) % len(hull)] - hull[i]) * f
        out.append([round(float(q[0]) * 100, 2), round(float(q[1]) * 100, 2)])
    return out


def leg_circ(P, E, z):
    loops = [L for L in slice_loops(P, E, z) if L[:, 0].mean() > 0.02]
    if not loops:
        return 0.0
    L = max(loops, key=lambda L: len(L))
    return hull_perimeter(L) * 100


def landmarks(P, E):
    H = P[:, 2].max()
    scan = lambda lo, hi, f: [(z, f(P, E, z)) for z in np.linspace(lo * H, hi * H, 60)]
    # the bust: the fullest slice, but only where both arms are clear of the torso (else the tape catches the armpits)
    clear = lambda z: len([L for L in slice_loops(P, E, z) if len(L) > 20]) >= 3
    bust = max([t for t in scan(0.66, 0.76, torso_circ) if clear(t[0])] or scan(0.66, 0.7, torso_circ), key=lambda t: t[1])[0]
    under = min(scan((bust / H) - 0.06, (bust / H) - 0.02, torso_circ), key=lambda t: t[1])[0]
    waist = min(scan(0.58, 0.66, torso_circ), key=lambda t: t[1])[0]
    hips = max(scan(0.47, 0.56, torso_circ), key=lambda t: t[1])[0]
    neck = min(scan(0.82, 0.87, torso_circ), key=lambda t: t[1] if t[1] > 5 else 999)[0]
    # crotch: the highest slice where the legs are two separate loops
    crotch = 0.45 * H
    for z in np.linspace(0.40 * H, 0.52 * H, 60):
        if len([L for L in slice_loops(P, E, z) if len(L) > 20 and abs(L[:, 0].mean()) > 0.03]) >= 2:
            crotch = z
    thigh = crotch - 0.03 * H
    return {"height": H, "bust": bust, "underbust": under, "waist": waist, "highHip": (waist + hips) / 2, "hips": hips, "neck": neck, "crotch": crotch, "thigh": thigh}


def measure(P, E, lm):
    """The measurements the app fits, in cm, at fixed slice heights (scaled with the body's height)."""
    H = P[:, 2].max()
    s = H / lm["height"]
    z = {k: v * s for k, v in lm.items()}
    return {
        "height": H * 100,
        "bust": torso_circ(P, E, z["bust"]),
        "underbust": torso_circ(P, E, z["underbust"]),
        "waist": torso_circ(P, E, z["waist"]),
        "highHip": torso_circ(P, E, z["highHip"]),
        "hips": torso_circ(P, E, z["hips"]),
        "neck": torso_circ(P, E, z["neck"]),
        "thigh": leg_circ(P, E, z["thigh"]),
        "napeWaist": (z["neck"] - z["waist"]) * 100,
        "waistHip": (z["waist"] - z["hips"]) * 100,
        "insideLeg": z["crotch"] * 100,
    }


def export(sex):
    h, keys, rig = build(sex)
    E = edges_of(h)
    P0 = coords(h, {})
    lm = landmarks(P0, E)
    base = measure(P0, E, lm)
    effects = {}
    for k in keys:
        m = measure(coords(h, {k: 1.0}), E, lm)
        effects[k] = {q: round(m[q] - base[q], 3) for q in base if abs(m[q] - base[q]) > 0.05}
    log(sex, "base", {k: round(v, 1) for k, v in base.items()})
    rings = {k: torso_outline(P0, E, lm[k]) for k in ("bust", "underbust", "waist", "highHip", "hips")}
    # the helmet head, then export
    egg = add_helmet(h, rig, sex)
    os.makedirs(OUT_GLB, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in (h, rig, egg):
        o.select_set(True)
    bpy.context.view_layer.objects.active = rig
    path = os.path.join(OUT_GLB, f"{sex}.glb")
    bpy.ops.export_scene.gltf(filepath=path, export_format="GLB", use_selection=True, export_apply=False,
                              export_morph=True, export_morph_normal=False, export_try_sparse_sk=True,
                              export_texcoords=False, export_materials="NONE", export_skins=True, export_animations=False,
                              export_yup=True)
    log(sex, "glb", path, os.path.getsize(path) // 1024, "KB")
    return {"base": {k: round(v, 2) for k, v in base.items()}, "rings": rings,
            "landmarks": {k: round(v * 100, 2) for k, v in lm.items()},
            "effects": effects}


model = {"note": "Generated by tools/body3d/export.py from MakeHuman (CC0) via MPFB2. cm. effects[key] = cm added by that shape key at weight 1.",
         "drivers": DRIVERS}
for sex in ("female", "male"):
    model[sex] = export(sex)
with open(OUT_JSON, "w") as f:
    json.dump(model, f, indent=1)
log("done", OUT_JSON)
