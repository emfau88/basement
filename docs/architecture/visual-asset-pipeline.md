# Visual asset pipeline

## Current strategy and transition

The deployed studio remains procedural-first until the photorealistic Games proof passes its approval gates. Its geometry, live screens and branded surfaces therefore remain the functional blockout, fast-loading fallback and recoverable production state.

The approved target is now a hybrid asset pipeline: optimized GLB/PBR assets for focus-visible architecture, furniture and hardware; procedural geometry, instancing and canvas surfaces where they remain the more efficient or interactive representation. The governing implementation plan and budgets live in `photorealism-plan.md`. No other zone receives the new treatment until the Games proof passes Decision Gate D.

## Shared resources

- `createSceneTools` owns caches for box, rounded-box and cylinder geometries.
- Canvas textures are cached by stable semantic keys and use the active detail budget's anisotropy limit.
- Repeated Game Lab ribs and keyboard keys use `THREE.InstancedMesh` rather than one draw object per part.
- Existing live-screen canvases remain independent because each carries changing project content.
- All twelve project previews are self-hosted as normalized WebP files (maximum 1280px), removing runtime dependence on external image hosts.

## Photoreal asset runtime

- `assetManager.ts` is dynamically imported, keeping GLTF/KTX2/HDR support out of the initial scene bundle until an asset area requests it.
- Binary GLB requests report progress and have explicit timeouts, cache invalidation after failure and caller-provided fallback groups.
- Meshopt decoding and KTX2/Basis transcoding are configured through the Three.js production loaders.
- HDR data is converted to a PMREM environment; missing HDR files resolve to `RoomEnvironment` rather than breaking the studio.
- Source models are cached, instances are cloned and GPU resources are disposed centrally on teardown.
- `pbrMaterials.ts` owns semantic presets, texture color-space rules and second-UV fallback handling.
- `npm run assets:prepare` creates and Meshopt-compresses a deterministic GLB smoke fixture.
- `npm run assets:inspect -- <file>`, `npm run assets:validate -- <file>` and `npm run assets:optimize -- <input> <output>` expose the production asset checks.
- `npm run qa:assets` verifies model success, model fallback, HDR fallback, teardown and runtime support assets in a browser.

## Legacy procedural budget

This table continues to define the current blockout/fallback profile. It does not replace the GLB/PBR budgets in `photorealism-plan.md`.

## Device detail budgets

| Budget | City blocks | Dust particles | Max cylinder segments | Rounded-box segments | Texture anisotropy | Decorative point lights |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Desktop | 26 | 160 | 24 | 5 | 4 | Yes |
| Mobile standard | 18 | 96 | 18 | 4 | 2 | Yes |
| Mobile low | 12 | 48 | 12 | 3 | 1 | No |

The selected scene budget follows the same startup profile as pixel ratio, antialiasing, shadows and bloom. Interactive meshes and all project content are identical across budgets; only decorative density and rendering cost change.

## Rules for future assets

1. Prefer authored GLB/PBR assets for focus-visible silhouettes that must read as physically credible; retain reusable primitives, instancing and canvas surfaces for small architectural or interactive details.
2. Add each external source to `asset-register.md` before committing its binary derivative.
3. A GLB must be inspected, validated and optimized, define a visible loading fallback and stay within the target area rather than blocking the room.
4. Reuse materials and textures by semantic key; do not create identical resources inside loops.
5. Any new decorative layer must define Desktop, Mobile standard and Mobile low behavior before merge.
6. Project previews ship locally under the Vite base path and are verified at the GitHub Pages `/basement/` subpath.
