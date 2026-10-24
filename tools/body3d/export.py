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
# the head to sculpt by hand (tools/body3d/README.md): written on the first export, read on every one after
HEAD_BLEND = os.path.join(ROOT, "tools", "body3d", "head.blend")
# the male's refinements, on top of the female head he wears (tools/body3d/README.md)
HEAD_MALE_BLEND = os.path.join(ROOT, "tools", "body3d", "head-male.blend")
HEAD_NAME = "Venty head"

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
    "upperArmLength": "arms/measure-upperarm-length",
    "lowerArmLength": "arms/measure-lowerarm-length",
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
    if sex in SMOOTH_CHEST and os.environ.get("BODY3D_NIPPLES", "1") == "1":
        mids = smooth_nipples(h, members("nipple", 0.02), sex)
        chest_sculpt(h, mids, sex)
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
SMOOTH_CHEST = {"female"}   # bodies whose nipples are smoothed away (a mannequin's chest)


def smooth_nipples(h, nipples, sex):
    """The nipples (MakeHuman's own group, and a small round area of the breast round each) are refilled as the
    smoothest surface that meets the breast, in the basis and in every shape key alike, so the bust stays smooth at
    every size the fitting gives it. Done before the body is measured, so the tape sees the smooth chest."""
    me = h.data
    n = len(me.vertices)
    nbr = [[] for _ in range(n)]
    for e in me.edges:
        a_, b_ = e.vertices
        nbr[a_].append(b_)
        nbr[b_].append(a_)

    def grow(vs, k):
        out = set(vs)
        for _ in range(k):
            out |= {j for i in list(out) for j in nbr[i]}
        return out

    # the free area: everything within 2 cm of each nipple's middle (sized in cm, not in rings: the mesh is far finer
    # at the nipple than round it; any wider and the fill folds over the curve under the breast), refilled as the
    # smoothest surface meeting the breast round it (a biharmonic fill, held by two rings of the breast)
    allc = np.empty(n * 3)
    me.vertices.foreach_get("co", allc)
    allc = allc.reshape(-1, 3)
    cs = allc[nipples]
    mids = [cs[cs[:, 0] > 0].mean(0), cs[cs[:, 0] < 0].mean(0)]
    r = float(os.environ.get("BODY3D_NIPPLE_R", "0.02"))
    free = {i for m in mids for i in np.nonzero(np.linalg.norm(allc - m, axis=1) < r)[0].tolist()}
    ring = grow(free, 2) - free
    S = sorted(free | ring)
    at = {v: i for i, v in enumerate(S)}
    L = np.zeros((len(S), len(S)))
    for v in S:
        if v in free or any(j in free for j in nbr[v]):   # rows needed for the bilaplacian of the free vertices
            i = at[v]
            L[i, i] = -1.0
            for j in nbr[v]:
                L[i, at[j]] += 1.0 / len(nbr[v])
    M = L @ L
    fi = [at[v] for v in sorted(free)]
    xi = [at[v] for v in S if v not in free]
    # the fill is linear in the breast round it, so one matrix serves the basis and every shape key
    T = -np.linalg.solve(M[np.ix_(fi, fi)], M[np.ix_(fi, xi)])
    idx_f, idx_x = np.array(sorted(free)), np.array([v for v in S if v not in free])
    blocks = [me.shape_keys.key_blocks[k] for k in range(len(me.shape_keys.key_blocks))] if me.shape_keys else []
    moved = 0.0
    for kb in blocks:
        co = np.empty(n * 3)
        kb.data.foreach_get("co", co)
        co = co.reshape(-1, 3)
        new = T @ co[idx_x]
        moved = max(moved, float(np.abs(new - co[idx_f]).max()))
        co[idx_f] = new
        kb.data.foreach_set("co", co.ravel())
    basis = np.empty(n * 3)
    me.shape_keys.key_blocks[0].data.foreach_get("co", basis)
    me.vertices.foreach_set("co", basis)
    me.update()
    log(sex, "nipples smoothed:", len(nipples), "verts,", len(free), "faired, moved up to", round(moved * 1000, 1), "mm,",
        len(blocks), "keys")
    return mids


def chest_sculpt(h, mids, sex):
    """The chest sculpted by hand in Blender (chest-<sex>.blend, tools/body3d/README.md). The first export writes the
    file (the torso, the rest hidden, all but the chest masked); every export after adds what was sculpted in it to
    the body and to every shape key alike, before the body is measured, so the tape and the fitting follow it."""
    path = os.path.join(ROOT, "tools", "body3d", f"chest-{sex}.blend")
    me = h.data
    n = len(me.vertices)
    co = np.empty(n * 3)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    d = np.min([np.linalg.norm(co - m, axis=1) for m in mids], axis=0)
    front = co[:, 1] < mids[0][1] + 0.06
    u = np.clip((d - 0.11) / 0.03, 0, 1)
    keep = np.where(front, u * u * (3 - 2 * u), 1.0)     # 1 = the script's, 0 = free to sculpt
    if not os.path.exists(path):
        zc = mids[0][2]
        PENDING_HEAD[path] = (co, [list(p.vertices) for p in me.polygons], keep,
                              (co[:, 2] < zc - 0.3) | (co[:, 2] > zc + 0.3), "Venty chest")
        return
    with bpy.data.libraries.load(path) as (src, dst):
        dst.meshes = [m for m in src.meshes if m.startswith("Venty chest")]
    if not dst.meshes:
        log(sex, os.path.basename(path), "has no mesh called Venty chest - the chest is left as it is")
        return
    cm = dst.meshes[0]
    base = cm.attributes.get("venty_base")
    if len(cm.vertices) != n or base is None:
        log(sex, os.path.basename(path), "does not match the body (Dyntopo or Remesh?) - the chest is left as it is")
        bpy.data.meshes.remove(cm)
        return
    U = np.zeros(n * 3)
    cm.vertices.foreach_get("co", U)
    B0 = np.zeros(n * 3)
    base.data.foreach_get("vector", B0)
    bpy.data.meshes.remove(cm)
    delta = (U - B0).reshape(-1, 3) * (1 - keep)[:, None]
    for kb in (me.shape_keys.key_blocks if me.shape_keys else []):
        k = np.empty(n * 3)
        kb.data.foreach_get("co", k)
        kb.data.foreach_set("co", (k.reshape(-1, 3) + delta).ravel())
    me.vertices.foreach_set("co", (co + delta).ravel())
    me.update()
    log(sex, "chest from", os.path.basename(path) + ", moved up to", round(float(np.abs(delta).max()) * 1000, 1), "mm")


REF = None   # the female head, once sculpted: the male body wears the same one


def sculpt_head(h, rig, sex, neck_z):
    """A mannequin head from MakeHuman's own. The ears go, and so does the whole face in front of them (eyes, lips,
    nostrils and all, with whatever sat inside); the opening is closed with a fresh, even grid, faired into the
    smoothest surface that meets the skull, the cheeks and the jaw, and a soft ridge of a nose is raised on it. The head
    stays one surface with the neck.

    The female head is sculpted; the male body gets the same head (the same cut and grid, so the same vertices),
    scaled to his head and blended into his own, thicker neck. Nothing moves at or below the neck measurement
    (neck_z), and every shape key keeps moving the head as it did (some carry the whole head up or down)."""
    global REF
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
    if REF:
        gone = {bm.verts[i] for i in REF["gone"]}
    else:
        gone |= {v for v in head if abs(math.atan2(v.co.x, mid.y - v.co.y) / wide) ** sq + abs((v.co.z - zc) / hz) ** sq < 1}
    rec = {"gone": sorted(v.index for v in gone), "loops": []}
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
    bm.verts.index_update()
    bm.verts.ensure_lookup_table()
    bm.edges.ensure_lookup_table()
    plans = []
    if REF:
        for kind, a_, b_ in REF["loops"]:
            plans.append((kind, [bm.verts[i] for i in a_], [bm.verts[i] for i in b_]))
    else:
        rim = {e for e in bm.edges if e.is_boundary and all(v.co.z > chin for v in e.verts)}
        loops, seen = [], set()
        for e in sorted(rim, key=lambda e: e.index):
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
            if n == len(loop) and n % 2 == 0 and n >= 8:
                # the grid runs between the bottom and the top of the loop, laid out evenly either side of the middle
                # of the face so it comes out symmetrical (the cut is: MakeHuman is)
                m = min(range(n), key=lambda i: abs(order[i].co.x) * 10 + order[i].co.z)
                nb = 2 * max(1, round(n / 8))
                ring = [order[(m - nb // 2 + i) % n] for i in range(n)]
                plans.append(("grid", ring[nb:n // 2 + 1], ring[n // 2 + nb:] + ring[:1]))
            else:
                plans.append(("fan", order, []))
    for kind, a_, b_ in plans:
        rec["loops"].append((kind, [v.index for v in a_], [v.index for v in b_]))
    for kind, a_, b_ in plans:
        filled = False
        if kind == "grid":
            edges = [bm.edges.get((r[i], r[i + 1])) for r in (a_, b_) for i in range(len(r) - 1)]
            try:
                filled = bool(bmesh.ops.grid_fill(bm, edges=edges, use_interp_simple=True)["faces"])
            except Exception as err:
                log(sex, "grid fill failed", len(a_), err)
        if not filled:
            ring = a_ + b_ if kind == "grid" else a_
            edges = [bm.edges.get((ring[i], ring[(i + 1) % len(ring)])) for i in range(len(ring))]
            f = bmesh.ops.holes_fill(bm, edges=[e for e in edges if e], sides=0)["faces"]
            bmesh.ops.poke(bm, faces=f)
    bm.verts.index_update()
    bm.verts.ensure_lookup_table()
    new = [bm.verts[i] for i in REF["new"]] if REF else [v for v in bm.verts if before.find(v.co)[2] > 1e-6]
    rec["new"] = sorted(v.index for v in new)
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

    def profile(X, tag):
        """the face's midline from the side: how far forward it reaches at a few heights (mm, + is forward)"""
        mm = np.abs(X[:, 0]) < 0.005
        out = []
        for dz in (0.04, 0.03, 0.02, 0.01, 0.0, -0.01, -0.02, -0.03, -0.04):
            sel = mm & (np.abs(X[:, 2] - (chin + dz)) < 0.0035)
            out.append(round(float(-X[sel, 1].min()) * 1000, 1) if sel.any() else None)
        log(sex, "profile", tag, "front at chin +4..-4 cm", out, "neck z", round(neck_z - chin, 3))

    # the neck where it is measured: its middle and half widths (the male's neck is fitted to his)
    ring = np.abs(O[:, 2] - neck_z) < 0.004
    rec["ring"] = np.array([0.0, (O[ring, 1].min() + O[ring, 1].max()) / 2, neck_z,
                            np.abs(O[ring, 0]).max(), (O[ring, 1].max() - O[ring, 1].min()) / 2])

    sk = list(bm.verts.layers.shape.values())
    newm = np.zeros(n, bool)
    newm[rec["new"]] = True
    K = []
    for layer in sk:
        k = np.array([(v[layer] - v.co)[:] for v in bm.verts])
        k[newm] = 0
        K.append(solve(lambda X: -L(X), k, newm)[0])

    if not REF:
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
            # and only from the cheekbones up: below them the lower face stays the smooth fill, so the tip of the nose and
            # the lips do not come back
            cheek = tip.z + float(os.environ.get("BODY3D_CHEEK", "0.012"))
            push *= np.clip((B[:, 2] - cheek) / 0.025, 0, 1)
            for _ in range(int(os.environ.get("BODY3D_PUSHSOFT", "30"))):
                push += 0.5 * free * (L(push[:, None])[:, 0] / np.maximum(deg[:, 0], 1))
            T = B + n0 * push[:, None]
            firm = np.maximum(hold, float(os.environ.get("BODY3D_HOLD", "0.05")))
            B, _ = solve(lambda X: L(L(X)) + firm * (X - T), T, free)

        # the whole head is then smoothed along each vertex's ray from the middle of its bounds only, in the head's oval: it evens out what
        # the envelope left (small bumps, the rim where the face met the forehead, the kink in profile) without the
        # shrinking a plain smoothing gives along a seam (a sphere stays a sphere). It fades in above the chin, so the jaw
        # line and the neck stay
        hm = B[:, 2] > chin
        c = np.array([(B[hm, 0].min() + B[hm, 0].max()) / 2, (B[hm, 1].min() + B[hm, 1].max()) / 2, (chin + top) / 2 + 0.01])
        # measured in the head's own oval (its half widths, depth and height), so the smoothing keeps an oval, not a ball
        ax = np.array([B[hm, 0].max() - c[0], (B[hm, 1].max() - B[hm, 1].min()) / 2, top - c[2]])
        D = (B - c) / ax
        r = np.linalg.norm(D, axis=1)
        U = D / np.maximum(r, 1e-9)[:, None]
        wr = np.clip((B[:, 2] - chin - 0.008) / 0.025, 0, 1)[:, None]
        rad = r[:, None].copy()
        for _ in range(int(os.environ.get("BODY3D_RADSOFT", "100"))):
            rad += 0.5 * wr * (L(rad) / deg)
        # the lower face and the chin are rounded further, so the old chin does not stand out as a knob below the
        # smooth face (fading out under the jaw, where the neck starts)
        lower = (np.clip((c[1] - B[:, 1]) / 0.03, 0, 1) * np.clip((B[:, 2] - chin + float(os.environ.get("BODY3D_UNDER", "0.012"))) / 0.02, 0, 1)
                 * np.clip((tip.z + 0.02 - B[:, 2]) / 0.03, 0, 1))[:, None]
        for _ in range(int(os.environ.get("BODY3D_CHIN", "200"))):
            rad += 0.5 * lower * (L(rad) / deg)
        B = c + U * rad * ax

        # the chin is drawn back towards the neck: the corner where the face turns under the jaw is pushed in along
        # the surface, most at the corner and fading out smoothly round it (the neck fairing below then rounds it)
        midl = (np.abs(B[:, 0]) < 0.006) & (B[:, 1] < c[1] - 0.05) & (B[:, 2] < tip.z - 0.02) & (B[:, 2] > neck_z + 0.01)
        cp = B[np.nonzero(midl)[0][np.argmin((B[:, 1] + B[:, 2])[midl])]]
        sx, syz = float(os.environ.get("BODY3D_CHIN_X", "0.04")), float(os.environ.get("BODY3D_CHIN_R", "0.022"))
        wc = np.exp(-((B[:, 0] / sx) ** 2 + ((B[:, 1] - cp[1]) / syz) ** 2 + ((B[:, 2] - cp[2]) / syz) ** 2) / 2)
        wc *= B[:, 2] > neck_z + 0.012
        B0c = B
        B = B - normals(B) * (float(os.environ.get("BODY3D_CHIN_IN", "0.010")) * wc)[:, None]
        log(sex, "chin corner", np.round(cp, 3).tolist())
        profile(B0c, "before")

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
        along = np.clip(t, 0, 1) ** 1.6 * np.clip((float(os.environ.get("BODY3D_NOSE_END", "0.8")) - t) / 0.3, 0, 1)
        width = 0.010 + 0.006 * np.clip(t, 0, 1)
        lift = height * along * np.exp(-(B[:, 0] / width) ** 2) * free
        for _ in range(6):
            lift += 0.5 * free * (L(lift[:, None])[:, 0] / np.maximum(deg[:, 0], 1))
        P = B + nB * lift[:, None]
        log(sex, "faired in", it, "free", int(free.sum()), "new", len(new), "nose", round(height, 4),
            "moved", round(float(np.abs(P - O)[free].max()), 3))
    else:
        # her head, scaled to his (the height from the chin to the crown) about the head joint, and blended into his
        # neck from just above the neck measurement up to the chin
        hbF, hbM = REF["hb"], np.array(rig.data.bones["head"].head_local[:])
        sc = (top - chin) / REF["height"]
        F = REF["P"]
        TH = hbM + sc * (F - hbF)
        # at the neck measurement her neck is laid onto his (its middle, width and depth), easing into the plain
        # scaling by the jaw, so his thicker neck runs smoothly up into her head
        rF, rM = REF["ring"], rec["ring"]
        TN = rM[:3] + (F - rF[:3]) * np.array([rM[3] / rF[3], rM[4] / rF[4], sc])
        u = np.clip((F[:, 2] - rF[2]) / float(os.environ.get("BODY3D_MALE_NECK", "0.02")), 0, 1)
        # (the chin, ahead of her neck, is head: it is only scaled)
        u = np.maximum(u, np.clip((rF[1] - rF[4] - F[:, 1]) / 0.015, 0, 1))
        u = (u * u * (3 - 2 * u))[:, None]
        T = TN * (1 - u) + TH * u
        # all of her head: her neck eases into his above his neck measurement, and her chin (everything in front of
        # her throat) is hers outright, wherever his own chin hung
        v_ = np.clip((T[:, 2] - neck_z - 0.002) / float(os.environ.get("BODY3D_MALE_JOIN", "0.008")), 0, 1)
        hers = np.clip((REF["throat"] - 0.004 - F[:, 1]) / 0.01, 0, 1) * (O[:, 2] > neck_z - 0.03)
        v_ = np.maximum(v_, hers)
        w = (v_ * v_ * (3 - 2 * v_))[:, None]
        P = O * (1 - w) + T * w
        log(sex, "her head on his body, scaled", round(sc, 3))

    # where the neck meets the head (under the jaw, the nape, and on the male the blend into his neck) is rebuilt as
    # the smoothest surface between the neck below and the head above (the same biharmonic fill as the face): the
    # muscles and the step left by the head go, and the chin curves on into the neck
    zz = P[:, 2]
    band = (zz > neck_z + float(os.environ.get("BODY3D_NECK_LOW", "0.012"))) & (zz < chin + float(os.environ.get("BODY3D_NECK_TOP", "0.03")))
    if REF:
        # on the male only the join of her neck into his is faired: her chin and jaw are kept as they are
        band = (zz > neck_z + 0.003) & (zz < neck_z + float(os.environ.get("BODY3D_MALE_FAIR", "0.05"))) &             ~((hers >= 1) & (zz > chin - float(os.environ.get("BODY3D_MALE_CHIN", "0.012"))))
    Pa, nit = solve(lambda X: L(L(X)), P, band)
    # the chin hangs below the neck measurement in front of the throat (the tape round the neck runs behind it).
    # Faired with the band it melts into the neck altogether; part of the way there, it rounds back towards the neck
    # and keeps a jaw under it
    th = (np.abs(P[:, 0]) < 0.015) & (zz > neck_z - 0.035) & (zz < neck_z - 0.012)
    throat = P[th, 1].min()
    rec["throat"] = throat
    band |= (zz > neck_z - 0.03) & (zz < chin + 0.03) & (P[:, 1] < throat - float(os.environ.get("BODY3D_THROAT", "0.012")))
    if REF:
        P = Pa          # the male's chin is hers already
    else:
        Pb, _ = solve(lambda X: L(L(X)), P, band)
        P = Pa + float(os.environ.get("BODY3D_CHIN_BACK", "0.45")) * (Pb - Pa)
    log(sex, "neck faired", int(band.sum()), "in", nit)
    profile(P, "final")

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
    if not REF:
        hand_sculpt(me, bm, faces_of(bm), neck_z, sex, HEAD_BLEND)
        profile(np.array([v.co[:] for v in bm.verts]), "sculpted")
    else:
        hand_sculpt(me, bm, faces_of(bm), neck_z, sex, HEAD_MALE_BLEND, relative=True)
    # every shape key moves the sculpted head as it moved the old one (nape to waist carries the whole head)
    for layer, k in zip(sk, K):
        for v in bm.verts:
            v[layer] = v.co + mathutils.Vector(k[v.index])
    if not REF:
        bm.verts.index_update()
        rec.update(P=np.array([v.co[:] for v in bm.verts]), hb=np.array(rig.data.bones["head"].head_local[:]),
                   chin=chin, neck=neck_z, height=top - chin)
        REF = rec
    bm.to_mesh(me)
    bm.free()
    for poly in me.polygons:
        poly.use_smooth = True


PENDING_HEAD = {}


def write_head_blend(path):
    """A head to sculpt, as a file of its own: the head (with the shoulders to show how it sits), the body below
    hidden and the neck masked, so only the head can be sculpted. Written last, on an empty file. The head as the
    script made it is kept in the file too (an attribute), so a relative file can tell what was sculpted."""
    co, faces, keep, hide, name = PENDING_HEAD[path]
    bpy.ops.wm.read_factory_settings(use_empty=True)
    hm = bpy.data.meshes.new(name)
    hm.from_pydata(co.tolist(), [], faces)
    hm.update()
    mask = hm.attributes.new(".sculpt_mask", "FLOAT", "POINT")
    mask.data.foreach_set("value", keep.astype(np.float32))
    base = hm.attributes.new("venty_base", "FLOAT_VECTOR", "POINT")
    base.data.foreach_set("vector", co.astype(np.float32).ravel())
    for poly in hm.polygons:
        poly.use_smooth = True
        poly.hide = bool(hide[list(poly.vertices)].any())
    ob = bpy.data.objects.new(name, hm)
    ob.use_mesh_mirror_x = True
    bpy.context.scene.collection.objects.link(ob)
    bpy.ops.wm.save_as_mainfile(filepath=path)
    log("file to sculpt written", path)


def faces_of(bm):
    return [[v.index for v in f.verts] for f in bm.faces]


def hand_sculpt(me, bm, faces, neck_z, sex, path, relative=False):
    """The head sculpted by hand in Blender (path), on top of the script's. The first export writes the file (the
    script's head, the body below the shoulders hidden, the neck masked); every export after takes the head from it:
    the head itself (head.blend, the female's), or, relative, only what was sculpted in it, added to the head as the
    script makes it now (head-male.blend: so a change to the female head still reaches the male). The neck
    measurement and the body below always stay the script's (the mask ramps from just above the measurement),
    whatever was sculpted there, so the fitting is never touched."""
    name = os.path.basename(path)
    bm.verts.index_update()
    co = np.array([v.co[:] for v in bm.verts])
    keep = np.clip((neck_z + 0.016 - co[:, 2]) / 0.012, 0, 1)   # 1 = the script's, 0 = free to sculpt
    # the chin, in front of the throat, is free however low it hangs: only the neck behind it is kept
    th = (np.abs(co[:, 0]) < 0.015) & (co[:, 2] > neck_z - 0.035) & (co[:, 2] < neck_z - 0.012)
    throat = co[th, 1].min()
    chin_free = np.clip((throat - 0.006 - co[:, 1]) / 0.01, 0, 1) * np.clip((co[:, 2] - neck_z + 0.01) / 0.006, 0, 1)
    keep *= 1 - chin_free
    if not os.path.exists(path):
        PENDING_HEAD[path] = (co, faces, keep, co[:, 2] < neck_z - 0.07, HEAD_NAME)
        return
    with bpy.data.libraries.load(path) as (src, dst):
        dst.meshes = [m for m in src.meshes if m.startswith(HEAD_NAME)]
    if not dst.meshes:
        log(sex, name + ": no mesh called", HEAD_NAME, "- the script's head is used")
        return
    hm = dst.meshes[0]
    if len(hm.vertices) != len(co):
        log(sex, name, "has", len(hm.vertices), "vertices, the body", len(co),
            "(Dyntopo or Remesh adds and removes them) - the script's head is used")
        bpy.data.meshes.remove(hm)
        return
    U = np.zeros(len(co) * 3)
    hm.vertices.foreach_get("co", U)
    U = U.reshape(-1, 3)
    if relative:
        base = hm.attributes.get("venty_base")
        if base is None:
            log(sex, name, "has no record of the head it started from - the script's head is used")
            bpy.data.meshes.remove(hm)
            return
        B0 = np.zeros(len(co) * 3)
        base.data.foreach_get("vector", B0)
        U = co + (U - B0.reshape(-1, 3))
    bpy.data.meshes.remove(hm)
    P = co * keep[:, None] + U * (1 - keep[:, None])
    for v in bm.verts:
        v.co = P[v.index]
    bm.normal_update()
    log(sex, "head from", name + ", moved up to", round(float(np.abs(P - co).max()) * 1000, 1), "mm")


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
    for name, pos, aim in (("front", (0, -1.2, top - 0.12), 0.14), ("side", (1.2, 0, top - 0.12), 0.14),
                           ("three", (0.75, -0.95, top - 0.08), 0.14), ("back", (0.95, 0.7, top - 0.1), 0.15),
                           ("neck", (0.9, -0.6, top - 0.24), 0.2), ("chest", (0.55, -1.3, top - 0.38), 0.38), ("nipple", (0.35, -0.45, top - 0.42), 0.43)):
        target = mathutils.Vector((0, 0, top - aim))
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


def group_weights(h, name):
    """Each vertex's weight in one vertex group (a bone's), 0 where it is not in it."""
    g = h.vertex_groups.get(name)
    w = np.zeros(len(h.data.vertices))
    if not g:
        return w
    for v in h.data.vertices:
        for x in v.groups:
            if x.group == g.index:
                w[v.index] = x.weight
    return w


def tape_points(h, P, lm):
    """The skin the length and arm tapes follow, chosen once on the base body so every shape key is measured on the same
    points: the nape, the waist at the back and the side, the hip at the side, the crotch, the top of each shoulder, and
    rings of skin across the upper arm and the wrist (cut square to the arm, not level)."""
    def pick(mask, score):
        idx = np.nonzero(mask)[0]
        return int(idx[np.argmax(score[idx])]) if len(idx) else 0
    x, y, z = P[:, 0], P[:, 1], P[:, 2]
    mid = np.abs(x) < 0.012
    # the torso only: at the waist and the hips the hanging arms are the widest thing
    arm = sum(group_weights(h, f"{b}_{sd}") for b in ("upperarm", "lowerarm", "hand") for sd in "lr")
    trunk = arm < 0.05
    sel = {
        "nape": pick(mid & (np.abs(z - lm["neck"]) < 0.012), y),
        "waistBack": pick(mid & (np.abs(z - lm["waist"]) < 0.012), y),
        "waistSide": pick(trunk & (np.abs(z - lm["waist"]) < 0.01) & (x > 0), x),
        "hipSide": pick(trunk & (np.abs(z - lm["hips"]) < 0.01) & (x > 0), x),
        "crotch": pick(mid & (z > lm["crotch"] - 0.05) & (z < lm["crotch"] + 0.08) & (np.abs(y - y[mid].mean()) < 0.06), -z),
    }
    up, lo, hand = (group_weights(h, f"{b}_l") for b in ("upperarm", "lowerarm", "hand"))
    sel["shoulderL"] = pick((up > 0.2) & (x > 0), z)
    sel["shoulderR"] = int(np.argmin(np.linalg.norm(P - P[sel["shoulderL"]] * np.array([-1, 1, 1]), axis=1)))

    def ring(mask_axis, mask_ring, at, toward):
        """A ring of skin square to a limb: its axis from the limb's own skin, the ring at a share of its length."""
        C = P[mask_axis]
        c = C.mean(0)
        a = np.linalg.svd(C - c)[2][0]
        if np.dot(toward - c, a) < 0:
            a = -a
        t = (P - c) @ a
        tm = t[mask_axis]
        t0 = tm.min() + (tm.max() - tm.min()) * at
        ids = np.nonzero(mask_ring & (np.abs(t - t0) < 0.007))[0]
        e1 = np.cross(a, [0, 0, 1.0]); e1 /= np.linalg.norm(e1)
        e2 = np.cross(a, e1)
        return {"ids": ids.tolist(), "e1": e1, "e2": e2}
    U = (up > 0.6) & (x > 0)
    Lw = (lo > 0.6) & (x > 0)
    sel["upperArm"] = ring(U, U, 0.42, P[Lw].mean(0))
    sel["wrist"] = ring(Lw, ((lo + hand) > 0.6) & (x > 0), 0.93, P[(hand > 0.6) & (x > 0)].mean(0))
    shoulder_z = P[sel["shoulderL"], 2]
    zf = (lm["bust"] + shoulder_z) / 2
    front = (np.abs(z - zf) < 0.006) & (up < 0.3) & (y < y[np.abs(z - zf) < 0.006].mean())
    sel["acrossFront"] = np.nonzero(front)[0].tolist()
    return sel


def measure(P, E, lm, sel=None):
    """The measurements the app fits, in cm. The circumferences at fixed slice heights (scaled with the body's height);
    the lengths, the shoulders and the arms on the skin points chosen in tape_points (so a shape key that moves them
    shows)."""
    H = P[:, 2].max()
    s = H / lm["height"]
    z = {k: v * s for k, v in lm.items()}
    out = {}
    if sel:
        def circ(r):
            Q = P[r["ids"]]
            return hull_perimeter(np.stack([Q @ r["e1"], Q @ r["e2"]], 1)) * 100 if len(Q) > 3 else 0.0
        F = P[sel["acrossFront"]]
        out = {
            "napeWaist": (P[sel["nape"], 2] - P[sel["waistBack"], 2]) * 100,
            "waistHip": (P[sel["waistSide"], 2] - P[sel["hipSide"], 2]) * 100,
            "insideLeg": (P[sel["crotch"], 2] - P[:, 2].min()) * 100,
            "acrossShoulder": float(np.linalg.norm(P[sel["shoulderL"]] - P[sel["shoulderR"]])) * 100,
            "acrossFront": float(F[:, 0].max() - F[:, 0].min()) * 100 if len(F) else 0.0,
            "upperArm": circ(sel["upperArm"]),
            "wrist": circ(sel["wrist"]),
            "shoulderWrist": float(np.linalg.norm(P[sel["shoulderL"]] - P[sel["wrist"]["ids"]].mean(0))) * 100,
        }
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
        **out,
    }


def export(sex):
    h, keys, rig = build(sex)
    E = edges_of(h)
    P0 = coords(h, {})
    lm = landmarks(P0, E)
    sel = tape_points(h, P0, lm)
    base = measure(P0, E, lm, sel)
    effects = {}
    for k in keys:
        m = measure(coords(h, {k: 1.0}), E, lm, sel)
        effects[k] = {q: round(m[q] - base[q], 3) for q in base if abs(m[q] - base[q]) > 0.05}
    log(sex, "base", {k: round(v, 1) for k, v in base.items()})
    rings = {k: torso_outline(P0, E, lm[k]) for k in ("bust", "underbust", "waist", "highHip", "hips")}
    # the mannequin head (the male wears the female's, so she is made first if need be), then export
    if sex == "male" and not REF:
        fh, _, frig = build("female")
        FE = edges_of(fh)
        sculpt_head(fh, frig, "female", landmarks(coords(fh, {}), FE)["neck"])
        h, keys, rig = build(sex)
        E = edges_of(h)
    sculpt_head(h, rig, sex, lm["neck"])
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
for path in PENDING_HEAD:
    write_head_blend(path)
if os.environ.get("BODY3D_PREVIEW"):
    log("preview only, nothing exported")
    sys.exit(0)
# a stamp of each model's bytes, so the app asks for the new file after every export (no stale copy in a cache)
import hashlib
model["glb"] = {sx: hashlib.md5(open(os.path.join(OUT_GLB, f"{sx}.glb"), "rb").read()).hexdigest()[:8]
                for sx in ("female", "male") if os.path.exists(os.path.join(OUT_GLB, f"{sx}.glb"))}
with open(OUT_JSON, "w") as f:
    json.dump(model, f, indent=1)
log("done", OUT_JSON)
