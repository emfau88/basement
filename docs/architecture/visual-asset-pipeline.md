# Visual asset pipeline

## Current strategy

The studio remains procedural-first. Geometry, live screens and branded surfaces are generated locally at runtime, so the initial experience has no blocking 3D-model download. The Bulk 6 Games prototype does not need a GLB loading path; adding one now would increase bundle and fallback complexity without improving the approved composition.

## Shared resources

- `createSceneTools` owns caches for box, rounded-box and cylinder geometries.
- Canvas textures are cached by stable semantic keys and use the active detail budget's anisotropy limit.
- Repeated Game Lab ribs and keyboard keys use `THREE.InstancedMesh` rather than one draw object per part.
- Existing live-screen canvases remain independent because each carries changing project content.
- All twelve project previews are self-hosted as normalized WebP files (maximum 1280px), removing runtime dependence on external image hosts.

## Device detail budgets

| Budget | City blocks | Dust particles | Max cylinder segments | Rounded-box segments | Texture anisotropy | Decorative point lights |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Desktop | 26 | 160 | 24 | 5 | 4 | Yes |
| Mobile standard | 18 | 96 | 18 | 4 | 2 | Yes |
| Mobile low | 12 | 48 | 12 | 3 | 1 | No |

The selected scene budget follows the same startup profile as pixel ratio, antialiasing, shadows and bloom. Interactive meshes and all project content are identical across budgets; only decorative density and rendering cost change.

## Rules for future assets

1. Prefer reusable primitives, instancing and canvas surfaces for small architectural or interface details.
2. Add GLB only when a silhouette or animation cannot be represented economically with existing primitives.
3. A GLB must use compressed geometry/textures, define a visible loading fallback and stay within the target area rather than blocking the room.
4. Reuse materials and textures by semantic key; do not create identical resources inside loops.
5. Any new decorative layer must define Desktop, Mobile standard and Mobile low behavior before merge.
6. Project previews ship locally under the Vite base path and are verified at the GitHub Pages `/basement/` subpath.
