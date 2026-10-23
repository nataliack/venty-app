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
import mathutils
import mathutils.kdtree
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
    global EARS, LIPS
    def members(name, w=0.3):
        g = h.vertex_groups.get(name)
        if not g:
            return []
        return [v.index for v in me.vertices if any(x.group == g.index and x.weight > w for x in v.groups)]
    EARS, LIPS = members("ears", 0.02), members("lips")
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


EARS, LIPS = [], []


def sculpt_head(h, rig, sex):
    """A mannequin head from MakeHuman's own. The ears go, and so does the whole face in front of them (eyes, lips,
    nostrils and all, with whatever sat inside); the opening is closed with a fresh, even grid, faired into the
    smoothest surface that meets the skull, the cheeks and the jaw, and a soft ridge of a nose is raised on it. The head
    stays one surface with the neck. Nothing below the chin moves, so the shape keys (all below the head) and the
    measurements are untouched."""
    me = h.data
    chin = rig.data.bones["head"].head_local.z - 0.045
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.verts.ensure_lookup_table()
    dl = bm.verts.layers.deform.verify()
    head_bone = h.vertex_groups["head"].index
    ears = [bm.verts[i] for i in EARS]
    head = [v for v in bm.verts if v.co.z > chin]
    top = max(v.co.z for v in head)
    brow = chin + (top - chin) * float(os.environ.get("BODY3D_BROW", "0.62"))
    # the tip of the nose and the top of its bridge, for the ridge raised later (MakeHuman faces -y)
    tip = min((v for v in head if v.co.z < brow and abs(v.co.x) < 0.01), key=lambda v: v.co.y).co.copy()
    bridge = min((v for v in head if abs(v.co.z - brow) < 0.006 and abs(v.co.x) < 0.01), key=lambda v: v.co.y).co.copy()

    gone = set(ears)
    # the face goes inside a rounded rectangle wrapped round the head (so the new grid has no sharp corner to fold
    # at): its width as an angle round the head's middle, its height from just under the lips (MakeHuman's own lips
    # group) to the brow
    mid = sum((v.co for v in head), mathutils.Vector()) / len(head)
    lip_low = min(bm.verts[i].co.z for i in LIPS) if LIPS else chin + 0.02
    low = max(lip_low - float(os.environ.get("BODY3D_LOW", "0.008")), chin + 0.006)
    zc, hz = (low + brow) / 2, (brow - low) / 2
    wide = float(os.environ.get("BODY3D_WIDE", "1.2"))
    sq = float(os.environ.get("BODY3D_SQUARE", "3"))
    gone |= {v for v in head if abs(math.atan2(v.co.x, mid.y - v.co.y) / wide) ** sq + abs((v.co.z - zc) / hz) ** sq < 1}
    # the outward-facing surface of the old face: its broad shape (the cheekbones, the nose, the chin) is
    # brought back onto the new one
    bm.normal_update()
    front = [v.co.copy() for v in gone if v not in ears and v.normal.dot((v.co - mid).normalized()) > 0.2]
    bmesh.ops.delete(bm, geom=list(gone), context="VERTS")
    # whatever that cut loose (the inside of the mouth, the backs of the eyes) floats inside: only the body stays
    bm.verts.index_update()
    part = [-1] * len(bm.verts)
    sizes = []
    for v in bm.verts:
        if part[v.index] >= 0:
            continue
        stack, k = [v], len(sizes)
        part[v.index] = k
        size = 0
        while stack:
            x = stack.pop()
            size += 1
            for e in x.link_edges:
                y = e.other_vert(x)
                if part[y.index] < 0:
                    part[y.index] = k
                    stack.append(y)
        sizes.append(size)
    keep = max(range(len(sizes)), key=sizes.__getitem__)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if part[v.index] != keep], context="VERTS")

    # the vertices from here on are known by where they sit (bmesh hands back new wrappers after its operators)
    before = mathutils.kdtree.KDTree(len(bm.verts))
    for i, v in enumerate(bm.verts):
        before.insert(v.co, i)
    before.balance()

    # the openings (the face, where the ears were), each closed with an even grid of quads
    rim = {e for e in bm.edges if e.is_boundary and all(v.co.z > chin for v in e.verts)}
    loops, seen = [], set()
    for e in rim:
        if e in seen:
            continue
        stack, loop = [e], []
        while stack:
            x = stack.pop()
            if x in seen:
                continue
            seen.add(x)
            loop.append(x)
            for v in x.verts:
                stack.extend(y for y in v.link_edges if y in rim and y not in seen)
        loops.append(loop)
    for loop in loops:
        # the loop in order
        nxt = {}
        for e in loop:
            a_, b_ = e.verts
            nxt.setdefault(a_, []).append(b_)
            nxt.setdefault(b_, []).append(a_)
        order = [loop[0].verts[0]]
        prev = None
        while True:
            cur = order[-1]
            step = [w for w in nxt[cur] if w is not prev]
            if not step or step[0] is order[0]:
                break
            prev = cur
            order.append(step[0])
        n = len(order)
        filled = False
        if n == len(loop) and n % 2 == 0 and n >= 8:
            # the grid runs between the bottom and the top of the loop, laid out evenly either side of the middle of
            # the face so it comes out symmetrical (the cut is: MakeHuman is)
            m = min(range(n), key=lambda i: abs(order[i].co.x) * 10 + order[i].co.z)
            nb = 2 * max(1, round(n / 8))
            ring = [order[(m - nb // 2 + i) % n] for i in range(n)]
            rails = ring[nb:n // 2 + 1], ring[n // 2 + nb:] + ring[:1]
            edges = [bm.edges.get((r[i], r[i + 1])) for r in rails for i in range(len(r) - 1)]
            try:
                out = bmesh.ops.grid_fill(bm, edges=edges, use_interp_simple=True)
                filled = bool(out["faces"])
            except Exception as err:
                log(sex, "grid fill failed", n, err)
        if not filled:
            f = bmesh.ops.holes_fill(bm, edges=loop, sides=0)["faces"]
            bmesh.ops.poke(bm, faces=f)
    new = [v for v in bm.verts if before.find(v.co)[2] > 1e-6]
    for v in new:
        v[dl].clear()
        v[dl][head_bone] = 1.0

    # the new grid and a few rings of the head round it are faired into the smoothest surface that meets the rest
    # (a biharmonic fill, solved outright with conjugate gradients)
    bm.verts.index_update()
    n = len(bm.verts)
    O = np.array([v.co[:] for v in bm.verts])
    src, dst = [], []
    for e in bm.edges:
        i, j = e.verts[0].index, e.verts[1].index
        src += [i, j]
        dst += [j, i]
    src, dst = np.array(src), np.array(dst)
    deg = np.bincount(src, minlength=n).astype(float)[:, None]

    def L(X):
        out = -deg * X
        np.add.at(out, src, X[dst])
        return out

    # how far each vertex is from the new grid, in rings: the grid moves freely, the head round it is held more
    # firmly the further out it is (so the old brow ridge and the cheeks melt into the new face, and the skull stays)
    R = int(os.environ.get("BODY3D_RINGS", "16"))
    dist = np.full(n, R + 1)
    for v in new:
        dist[v.index] = 0
    for k in range(1, R + 1):
        hit = np.zeros(n, bool)
        hit[src[dist[dst] == k - 1]] = True
        dist[hit & (dist > k)] = k
    free = (dist <= R) & (O[:, 2] > chin - 0.004)
    hold = float(os.environ.get("BODY3D_FIRM", "1.0")) * np.clip((dist - 2) / (R - 2), 0, 1)[:, None] ** 2

    def solve(op, X, mask):
        """Conjugate gradients: the vertices in mask moved until op(X) is zero there, the rest held."""
        X = X.copy()
        r = np.zeros_like(X)
        r[mask] = -op(X)[mask]
        d = r.copy()
        rr = (r * r).sum(0)
        zero = op(np.zeros_like(X))
        for it in range(6000):
            Q = op(d) - zero
            Q[~mask] = 0
            alpha = rr / np.maximum((d * Q).sum(0), 1e-30)
            X += alpha * d
            r -= alpha * Q
            rn = (r * r).sum(0)
            if rn.max() < 1e-22:
                break
            d = r + (rn / np.maximum(rr, 1e-30)) * d
            rr = rn
        return X, it

    grid = dist == 0
    G, _ = solve(lambda X: -L(X), O, grid)
    B, it = solve(lambda X: L(L(X)) + hold * (X - G), G, free)

    # the new face is brought out to the old one's outer envelope (along the surface's normal, the furthest point of
    # the old face within a small radius, so the eyes, the lips' parting and the nostrils close over), then softened
    near3d = mathutils.kdtree.KDTree(len(front))
    for i, c in enumerate(front):
        near3d.insert(c, i)
    near3d.balance()
    reach = float(os.environ.get("BODY3D_REACH", "0.025"))
    F = np.array([c[:] for c in front])
    tris0 = np.array([[f.loops[0].vert.index, f.loops[i].vert.index, f.loops[i + 1].vert.index]
                      for f in bm.faces for i in range(1, len(f.loops) - 1)])

    def normals(X):
        fn0 = np.cross(X[tris0[:, 1]] - X[tris0[:, 0]], X[tris0[:, 2]] - X[tris0[:, 0]])
        out = np.zeros_like(X)
        for c in range(3):
            np.add.at(out, tris0[:, c], fn0)
        return out / np.maximum(np.linalg.norm(out, axis=1), 1e-12)[:, None]

    # a few rounds, each reaching from where the last one left the surface
    for _ in range(int(os.environ.get("BODY3D_PASSES", "1"))):
        n0 = normals(B)
        push = np.zeros(n)
        for i in np.nonzero(free)[0]:
            hits = [j for _, j, _ in near3d.find_range(B[i], reach)]
            if hits:
                push[i] = max(float(((F[hits] - B[i]) @ n0[i]).max()), 0.0)
        # easing off towards the brow, so the face meets the forehead without a ledge (the old brow ridge stood out)
        push *= float(os.environ.get("BODY3D_FULL", "0.85")) * np.clip((brow - 0.01 - B[:, 2]) / float(os.environ.get("BODY3D_EASE", "0.04")), 0, 1)
        for _ in range(int(os.environ.get("BODY3D_PUSHSOFT", "30"))):
            push += 0.5 * free * (L(push[:, None])[:, 0] / np.maximum(deg[:, 0], 1))
        T = B + n0 * push[:, None]
        firm = np.maximum(hold, float(os.environ.get("BODY3D_HOLD", "0.05")))
        B, _ = solve(lambda X: L(L(X)) + firm * (X - T), T, free)

    # the whole head is then smoothed along each vertex's ray from the middle of its bounds only: it evens out what
    # the envelope left (small bumps, the rim where the face met the forehead, the kink in profile) without the
    # shrinking a plain smoothing gives along a seam (a sphere stays a sphere). It fades in above the chin, so the jaw
    # line and the neck stay
    hm = B[:, 2] > chin
    c = np.array([(B[hm, 0].min() + B[hm, 0].max()) / 2, (B[hm, 1].min() + B[hm, 1].max()) / 2, (chin + top) / 2 + 0.01])
    D = B - c
    r = np.linalg.norm(D, axis=1)
    U = D / np.maximum(r, 1e-9)[:, None]
    wr = np.clip((B[:, 2] - chin - 0.015) / 0.03, 0, 1)[:, None]
    rad = r[:, None].copy()
    for _ in range(int(os.environ.get("BODY3D_RADSOFT", "100"))):
        rad += 0.5 * wr * (L(rad) / deg)
    B = c + U * rad

    # a soft ridge of a nose, rising from the brow to where the tip was and easing off below it
    tris = np.array([[f.loops[0].vert.index, f.loops[i].vert.index, f.loops[i + 1].vert.index]
                     for f in bm.faces for i in range(1, len(f.loops) - 1)])
    fn = np.cross(B[tris[:, 1]] - B[tris[:, 0]], B[tris[:, 2]] - B[tris[:, 0]])
    nB = np.zeros_like(B)
    for c in range(3):
        np.add.at(nB, tris[:, c], fn)
    nB /= np.maximum(np.linalg.norm(nB, axis=1), 1e-12)[:, None]
    height = float(os.environ.get("BODY3D_NOSE", "0.007"))
    t = (bridge.z - B[:, 2]) / max(bridge.z - tip.z, 1e-3)
    along = np.where(t < 1, np.clip(t, 0, 1) ** 1.6, np.exp(-((t - 1) / 0.22) ** 2))
    width = 0.010 + 0.006 * np.clip(t, 0, 1)
    lift = height * along * np.exp(-(B[:, 0] / width) ** 2) * free
    for _ in range(6):
        lift += 0.5 * free * (L(lift[:, None])[:, 0] / np.maximum(deg[:, 0], 1))
    P = B + nB * lift[:, None]
    log(sex, "faired in", it, "free", int(free.sum()), "new", len(new), "nose", round(height, 4),
        "moved", round(float(np.abs(P - O)[free].max()), 3))

    for v in bm.verts:
        v.co = P[v.index]
    # the grid's corners can fold a cell over: those and the cells round them are relaxed flat
    for _ in range(3):
        bm.normal_update()
        odd = [f for f in bm.faces if f.calc_center_median().z > chin and
               sum((g.normal for e in f.edges for g in e.link_faces if g is not f), mathutils.Vector()).dot(f.normal) < 0]
        if not odd:
            break
        relax = {v for f in odd for v in f.verts}
        for _ in range(2):
            relax |= {e.other_vert(v) for v in list(relax) for e in v.link_edges}
        relax = [v for v in relax if v.co.z > chin]
        for _ in range(15):
            moved = {v: sum((e.other_vert(v).co for e in v.link_edges), mathutils.Vector()) / len(v.link_edges) for v in relax}
            for v, c in moved.items():
                v.co = v.co.lerp(c, 0.5)
    log(sex, "folded cells left", len(odd))
    # the grid faces out like the rest of the head (a fill can face either way)
    bmesh.ops.recalc_face_normals(bm, faces=list(bm.faces))
    # every shape key follows the sculpted head (the keys do not move the head, so they match the basis there)
    sk = list(bm.verts.layers.shape.values())
    for v in bm.verts:
        if v.co.z > chin - 0.01:
            for layer in sk:
                v[layer] = v.co.copy()
    bm.to_mesh(me)
    bm.free()
    for poly in me.polygons:
        poly.use_smooth = True


def preview(h, sex):
    """Renders the head from the front and the side (workbench, matte), to check the sculpt."""
    import mathutils
    scn = bpy.context.scene
    scn.render.engine = "BLENDER_WORKBENCH"
    scn.render.resolution_x = scn.render.resolution_y = 700
    scn.display.shading.light = "STUDIO"
    if os.environ.get("BODY3D_MATCAP"):
        # a shiny matcap shows a dent the way the chrome look in the app does
        scn.display.shading.light = "MATCAP"
        scn.display.shading.studio_light = os.environ["BODY3D_MATCAP"]
    scn.display.shading.color_type = "SINGLE"
    scn.display.shading.single_color = (0.9, 0.91, 0.94)
    top = max((h.matrix_world @ v.co).z for v in h.data.vertices)
    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 85
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scn.camera = cam
    target = mathutils.Vector((0, 0, top - 0.14))
    for name, pos in (("front", (0, -1.2, top - 0.12)), ("side", (1.2, 0, top - 0.12)), ("three", (0.75, -0.95, top - 0.08))):
        cam.location = pos
        cam.rotation_euler = (target - mathutils.Vector(pos)).to_track_quat("-Z", "Y").to_euler()
        scn.render.filepath = os.path.join(ROOT, "tools", "body3d", "preview", f"{sex}-head-{name}.png")
        bpy.ops.render.render(write_still=True)


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
    sculpt_head(h, rig, sex)
    if os.environ.get("BODY3D_PREVIEW"):
        preview(h, sex)
        return None
    os.makedirs(OUT_GLB, exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    for o in (h, rig):
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
for sex in (os.environ.get("BODY3D_SEX") or "female,male").split(","):
    model[sex] = export(sex)
if os.environ.get("BODY3D_PREVIEW"):
    log("preview only, nothing exported")
    sys.exit(0)
with open(OUT_JSON, "w") as f:
    json.dump(model, f, indent=1)
log("done", OUT_JSON)
