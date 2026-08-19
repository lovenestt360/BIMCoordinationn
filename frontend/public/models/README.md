# Hero building model — conversion spec

The Hero section and the Clash Detection showcase (Process step 04) both render
a single file from this folder: **`hero-building.glb`**. It does not exist yet —
until it's added, both sections automatically render a procedural placeholder
building, so nothing is blocked on this conversion.

## Drop-in path (must match exactly)

```
frontend/public/models/hero-building.glb
```

No code changes are needed once the file lands here — the app tries to load it
on every page load, and only falls back to the placeholder on a load error.

## Conversion steps

Starting point: a real Revit (`.rvt`) or Navisworks (`.nwd`/`.nwc`) export of one
of the coordinated projects.

1. **Export to an interchange format:**
   - From Revit: `File → Export → IFC`, using the "Coordination View 2.0" (IFC4)
     setup. Export only the disciplines you want visible (e.g. Architectural +
     Structural + the relevant MEP system) to keep the file size down.
   - From Navisworks only (no source Revit file available): `File → Export → FBX`
     instead, and use the FBX→glTF path in Blender below.

2. **Convert to glTF** — either path works:
   - **Blender + Bonsai (formerly BlenderBIM) add-on** (recommended, GUI):
     `File → Import → IFC` (or `Import → FBX`), then `File → Export → glTF 2.0`.
     In the export dialog: enable **Draco Mesh Compression**, set the texture
     size limit to 1024px, and use the decimate/simplify option to hit the
     triangle budget below.
   - **CLI (reproducible/scriptable):**
     ```
     IfcConvert model.ifc model.glb
     npx @gltf-transform/cli optimize model.glb hero-building.glb \
       --compress draco --texture-compress webp
     ```

3. **Budget / spec — please stick to these so the scene stays smooth on mobile:**
   - ≤150,000 triangles total (this model is always visible in the background —
     keep it light).
   - Draco-compressed.
   - A **single** `.glb` file with textures embedded (not a separate `.bin` or
     textures folder) — so "drop in one file" stays literally true.
   - Textures ≤1024×1024, JPEG or WebP.
   - **Export at the model's own centroid, not the project's absolute site
     coordinates.** Revit survey points are often thousands of meters from the
     origin, which can export a huge, off-center mesh. (The app does normalize
     scale/position automatically as a safety net, but exporting centered
     avoids relying on that.)

4. **Optional — precise clash camera hotspot:** before exporting, add an Empty
   (Blender) or a named reference point at the specific clash location you want
   the Clash Detection camera to fly to, and name it exactly `ClashCameraTarget`.
   If present, the app uses its position as the fly-to target; if absent, it
   falls back to the model's bounding-box center — so v1 works either way.
