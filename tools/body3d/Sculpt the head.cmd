@echo off
rem Opens the Venty head in Blender, ready to sculpt (see README.md). Save with Ctrl+S, then close Blender.
"C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" "%~dp0head.blend" --python "%~dp0sculpt_setup.py"
