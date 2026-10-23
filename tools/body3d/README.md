# Sculpting the Venty head

The 3D bodies (`public/body3d/female.glb`, `male.glb`) are made by `export.py`. The head is sculpted by hand in `head.blend`, and every export takes the head from that file. Both bodies get the same head: the male's is scaled to fit him.

## Sculpt

1. In File Explorer, open `venty-app\tools\body3d` and double-click **Sculpt the head.cmd**. Blender opens in Sculpt mode, with the head facing you.
2. Pick a brush from the row along the bottom. Hover over one to see its name. Good ones to start with:
   - **Smooth:** evens out bumps and dents. You can also hold **Shift** with any brush to smooth.
   - **Grab:** pulls an area, like moving clay with your thumb. Good for the chin or the jaw line.
   - **Draw** and **Inflate:** build an area up. Hold **Ctrl** while stroking to push it in instead.
   - **Clay Strips:** builds up in flat layers, for a cheekbone or a brow.
3. Drag over the head to sculpt. Left and right are mirrored, so one side does both.
4. **Size and strength:** press **F** and move the mouse to resize the brush, then click. Press **Shift+F** for strength, or use Size and Strength at the top.
5. **Undo** is **Ctrl+Z**.
6. **Save** with **Ctrl+S**, close Blender, and tell Claude "head saved". Claude exports both bodies, checks them and pushes them to the lab.

## Moving the view

- **Mouse:** hold the middle button (the wheel) and drag to turn. Scroll to zoom. Shift + middle drag pans.
- **Trackpad:** drag the coloured ball at the top right of the view to turn. Drag the hand icon below it to pan, and the magnifier to zoom.
- **Numpad:** 1 shows the front, 3 the side, 7 the top.

## Don't

- **Dyntopo, Remesh, Multires:** these add and remove vertices. The export then can't use the file and keeps the previous head.
- **Moving the whole object** in Object mode: it is ignored.

The neck where it is measured, and the body below it, are protected (the dark masked band). Sculpting there has no effect, so the fitting always stays right.

## Start over

Delete `head.blend` and run the export: the script writes a fresh one from its own head. Or ask Claude to "reset the head".
