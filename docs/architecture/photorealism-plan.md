# Photorealism production plan

Status: Games Desktop baseline approved; full Desktop rollout authorized

Scope: complete all Desktop zones against the approved Games baseline; resume Mobile optimization after Decision Gate E

Renderer: current Three.js WebGL renderer for the proof

## Outcome contract

“Photorealistic” means the approved fixed-camera Games capture can plausibly read as a photographed, designed interior rather than a procedural 3D illustration. It is not satisfied by extra bloom, more geometry or darker colors alone.

The proof must demonstrate all of the following:

- coherent real-world scale and believable construction thickness;
- authored silhouettes and beveled edges on focus-visible furniture and hardware;
- physically plausible PBR response for concrete, wood, coated metal, glass, plastics and emissive screens;
- stable image-based lighting, contact grounding, controlled highlights and readable shadow detail;
- natural material variation without obvious tiling or uniformly perfect surfaces;
- the existing project selection, screen content, navigation and mobile sheet behavior without regression;
- fixed-reference Desktop similarity and intentional Mobile reframing, not a separate mobile site.

The Games reference gate and Desktop art-direction gate have passed. Existing procedural zones remain supported blockout/fallback geometry until their individual rollout bulks are accepted; they are not labelled as final photorealistic results.

## Canonical visual reference

The concept mockup shown earlier in the conversation is not currently present in the repository. Before Bulk 15 changes the visible scene:

1. add the approved source image under `docs/reference/photorealism/`;
2. record its filename, dimensions, date and approval status here;
3. capture the current Games view at the exact Desktop QA viewport and camera;
4. create a gap audit covering composition, architecture, objects, materials, light, atmosphere and typography;
5. explicitly record any deliberate departure from the mockup.

The current comparison capture is `docs/qa/current/desktop-1440x900-games.jpg`. Reference intake instructions and the reserved canonical location are in `docs/reference/photorealism/README.md`.

The target Desktop comparison viewport is 1440 × 900. Mobile uses 390 × 844 and 430 × 932 in portrait plus the existing landscape profile. Mobile is judged on hierarchy, legibility and scene visibility rather than pixel-identical composition.

## Rendering approach

### Keep WebGL for the proof

The current renderer already supports the required production path. Migrating to WebGPU during the visual proof would mix renderer risk with asset and art-direction risk. A renderer migration may be evaluated after the Games proof, using evidence rather than treating it as a prerequisite for quality.

### Physically based materials

- Use `MeshStandardMaterial` or `MeshPhysicalMaterial` only when its additional effects are visible and affordable.
- Mark base-color and emissive color textures as sRGB; treat normal, roughness, metalness, AO and lightmaps as non-color data.
- Author valid tangents where normal maps require them.
- Provide the second UV set required by AO and lightmaps.
- Prefer packed occlusion/roughness/metalness data when the source asset and tooling support it.
- Avoid uniform roughness and razor-sharp edges on hero objects.

### Lighting and reflections

- Use a compact HDR environment processed through PMREM for physically plausible indirect/specular response.
- Keep one principal shadow-casting light at most in the Games proof.
- Treat decorative practical lights as emissive or non-shadowing unless a measured comparison proves otherwise.
- Use baked AO/lightmaps, authored decals or low-cost contact solutions for stable secondary grounding.
- Keep bloom restrained and limited to genuinely emissive surfaces; postprocessing must not hide weak materials or lighting.

### Asset delivery

- Use binary glTF/GLB for authored geometry.
- Inspect and validate every source and production GLB.
- Optimize per asset: deduplicate, prune, instance repeated meshes, join only where it actually reduces cost, simplify distant variants and compress geometry.
- Use KTX2/Basis for production texture delivery when browser/device validation succeeds.
- Prefer Meshopt for general compressed delivery; use Draco when its measured payload/decode tradeoff is better for a specific asset.
- Load Games assets lazily and retain a visually coherent lightweight fallback.
- Resolve every runtime URL through the Vite base path so GitHub Pages subpath deployment remains valid.

## Asset and license policy

Preferred sources are self-authored assets and clearly licensed CC0 libraries such as Poly Haven and ambientCG. Every external item must be entered in `docs/architecture/asset-register.md` before it is committed.

Required record fields are source URL, creator/provider, license, download date, original filename/version, local production path, checksum, modifications and attribution requirement. “Free download” is not a license. Assets with unclear, editorial-only, non-redistributable or model-training-only terms are rejected.

Branded, portfolio-specific and interaction-bearing objects should be authored locally. Generic surfaces, HDR environments and secondary props may use verified third-party sources.

## Performance and delivery budgets

Budgets are ceilings for the complete Games focus view, not targets to fill.

| Metric | Desktop | Mobile standard | Mobile low |
| --- | ---: | ---: | ---: |
| Transition/render p95 frame time | <= 22 ms | <= 33 ms | <= 42 ms |
| Games deferred asset transfer | <= 5.0 MB | <= 2.5 MB | <= 1.5 MB |
| Visible triangles in Games focus | <= 500k | <= 220k | <= 120k |
| Draw calls in Games focus | <= 180 | <= 120 | <= 90 |
| Largest hero texture edge | 2048 px | 1024 px | 1024 px |
| Secondary texture edge | 1024 px | 1024/512 px | 512 px |
| Dynamic shadow-casting lights | 1 | 1 | 0–1 |

Additional requirements:

- navigation and the lightweight room remain usable while deferred assets load;
- asset failure leaves a deliberate fallback, never a blank or broken scene;
- renderer memory, asset decode time and peak main-thread stalls are recorded during Bulk 18;
- the existing demand-driven idle behavior is preserved;
- budgets may be tightened after physical-device measurement, but may only be relaxed with documented evidence and approval.

## Production sequence

1. Reference lock: store the canonical mockup, current fixed capture, gap audit and approved deviations.
2. Asset audit: shortlist the shell, hero furniture, hardware, materials and HDR source; complete the license register.
3. Invisible foundation: loaders, compression/validation pipeline, error fallback, caching and disposal.
4. Shell proof: scale, architecture, camera, environment, exposure and one principal shadow source.
5. Hero pass: focus-visible authored assets and final material families.
6. Optimization pass: explicit Desktop/Mobile variants, compression, instancing, LOD and measured budgets.
7. Approval gate: side-by-side Desktop proof, real-phone Mobile proof and an explicit expand/stop decision.
8. Desktop rollout: shared studio shell, Web, Projects and Archive after Games approval.
9. Desktop integration gate: approve all five views as one coherent set.
10. Mobile and release: implement measured LOD/framing tiers and perform physical-device validation only after Desktop approval.

## Verification matrix

Each implementation bulk must pass:

- TypeScript typecheck and production build;
- current interaction and responsive Playwright suites;
- GitHub Pages `/basement/` subpath run;
- loader success, slow-load, missing-asset and WebGL recovery checks;
- fixed-camera screenshots at all approved viewport profiles;
- Desktop regression check outside the intentionally changed scene area;
- performance capture against the applicable table above;
- license-register review for every new binary or texture.

Bulk 18 additionally requires a physical-phone review. Automated emulation alone cannot approve the final mobile result.

## Research basis

- Three.js `GLTFLoader` supports Draco, KTX2/Basis, Meshopt and GPU-instancing extensions when the corresponding decoders/loaders are configured: <https://threejs.org/docs/pages/GLTFLoader.html>
- Three.js PBR materials require correct texture color spaces, PMREM-preprocessed environment lighting and a second UV set for AO/lightmaps: <https://threejs.org/docs/pages/MeshStandardMaterial.html>
- PMREM supplies roughness-aware filtered environment lighting: <https://threejs.org/docs/pages/PMREMGenerator.html>
- Dynamic shadows multiply scene-rendering work per shadow-casting light, especially point lights: <https://threejs.org/manual/en/shadows.html>
- Postprocessing uses additional render passes and must finish with correct output conversion: <https://threejs.org/manual/en/post-processing.html>
- glTF Transform provides inspect, validate, geometry optimization/compression and texture delivery tooling: <https://gltf-transform.dev/cli>
- Poly Haven states its HDRIs, textures and models are CC0: <https://polyhaven.com/license>
- ambientCG asset pages state their assets are CC0: <https://ambientcg.com/>

These sources define capabilities and constraints. The numeric project budgets above are project decisions and must be verified on the actual scene and phone.
