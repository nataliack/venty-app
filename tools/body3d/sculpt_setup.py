"""Opens head.blend ready to sculpt: Sculpt mode, the head from the front, mirrored left to right, in a shiny
look that shows every dent the way the app's chrome does. Run by "Sculpt the head.cmd" and "Sculpt the male head.cmd"."""
import bpy

NAME = "Venty head"


def ready():
    ob = bpy.data.objects.get(NAME)
    win = bpy.context.window_manager.windows[0]
    area = next((a for a in win.screen.areas if a.type == "VIEW_3D"), None)
    if not ob or not area:
        return 0.5
    region = next(r for r in area.regions if r.type == "WINDOW")
    space = area.spaces.active
    space.shading.type = "SOLID"
    space.shading.light = "MATCAP"
    space.shading.studio_light = "metal_carpaint.exr"
    space.overlay.show_floor = False
    space.overlay.show_axis_x = space.overlay.show_axis_y = False
    with bpy.context.temp_override(window=win, area=area, region=region):
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.object.mode_set(mode="SCULPT")
        bpy.ops.view3d.view_axis(type="FRONT")
    # the head filling the view (the sculptable part: not hidden, not masked)
    me = ob.data
    mask = me.attributes.get(".sculpt_mask")
    free = [v.co for i, v in enumerate(me.vertices) if not v.hide and (not mask or mask.data[i].value < 0.5)]
    if free:
        zs = [c.z for c in free]
        r3d = space.region_3d
        r3d.view_location = (0.0, sum(c.y for c in free) / len(free), (min(zs) + max(zs)) / 2 - 0.02)
        r3d.view_distance = 0.55
    ob.use_mesh_mirror_x = True
    return None


bpy.app.timers.register(ready, first_interval=0.5)
