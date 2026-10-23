# Probe: create a MakeHuman base body with MPFB2 (headless) and report what it contains.
# Run: blender -b --factory-startup? (no: MPFB lives in the user extensions) -> blender -b --python tools/body3d/probe.py
import bpy, sys
from bl_ext.user_default.mpfb.services.humanservice import HumanService
from bl_ext.user_default.mpfb.services.targetservice import TargetService

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

macros = TargetService.get_default_macro_info_dict()
print("MACROS", {k: v for k, v in macros.items() if k != "race"}, macros["race"])
macros["gender"] = 0.0
h = HumanService.create_human(mask_helpers=True, detailed_helpers=False, extra_vertex_groups=True, feet_on_ground=True, scale=0.1, macro_detail_dict=macros)
me = h.data
print("VERTS", len(me.vertices), "FACES", len(me.polygons))
print("GROUPS", [g.name for g in h.vertex_groups])
print("SHAPEKEYS", [k.name for k in (me.shape_keys.key_blocks if me.shape_keys else [])])
zs = [v.co.z for v in me.vertices]; xs = [v.co.x for v in me.vertices]; ys = [v.co.y for v in me.vertices]
print("BOUNDS x", min(xs), max(xs), "y", min(ys), max(ys), "z", min(zs), max(zs))
print("DIMS", h.dimensions[:])
sys.stdout.flush()
