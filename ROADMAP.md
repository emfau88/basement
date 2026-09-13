# EMFAU Virtual Studio roadmap

Last updated: 2026-09-13
Current phase: Phase E — Photorealistic Desktop rollout
Current bulk: Bulk 23.2 — Focus-aware screen fidelity — complete; Decision gate E pending

## Status legend

- [x] Complete and verified
- [ ] Planned
- [ ] **IN PROGRESS** marks the active bulk

## Non-negotiable guardrails

- [x] Preserve the pre-redesign production state on remote branch `backup/pre-mobile-redesign-2026-09-12`.
- [x] Develop only on `mobile/scene-first-ux` until review.
- [x] Keep Desktop (`>= 761px`) visually and functionally unchanged throughout Phase A.
- [x] Keep project data and application state shared between Desktop and Mobile.
- [x] Avoid a separate mobile website or duplicated project content.
- [x] Keep every bulk independently buildable, reviewable and revertible.
- [x] Require typecheck, production build and visual QA before completing a bulk.

## Phase A — Mobile UX

### Bulk 0 — Baseline and guardrails — COMPLETE

- [x] Synchronize the merged `main` branch.
- [x] Create and push a remote backup branch at the exact production commit.
- [x] Create the working branch from the same production commit.
- [x] Document current camera presets and UI behavior.
- [x] Define the canonical mobile breakpoint and synchronize runtime checks.
- [x] Define the desktop/mobile regression matrix.
- [x] Capture all five views at Desktop 1440 × 900.
- [x] Capture all five views at Mobile 390 × 844.
- [x] Capture all five views at Mobile 430 × 932.
- [x] Verify typecheck, build, audit and browser console.
- [x] Commit and push Bulk 0.

Acceptance: the current experience is reproducible, recoverable and objectively comparable before visual changes begin.

### Bulk 1 — Isolated mobile layout foundation — COMPLETE

- [x] Introduce mobile viewport and safe-area layout variables.
- [x] Use dynamic viewport units without changing Desktop.
- [x] Isolate the mobile UI component lifecycle.
- [x] Stabilize resize and orientation changes.
- [x] Confirm zero Desktop screenshot regressions (`0.001–0.007%` capture variance).

Acceptance: Mobile has an isolated layout foundation; Desktop remains unchanged.

### Bulk 2 — Compact navigation and collapsed sheet — COMPLETE

- [x] Replace large mobile cards with a compact fixed navigation.
- [x] Add the collapsed contextual sheet above navigation.
- [x] Model explicit `collapsed` and `expanded` states.
- [x] Collapse when the user taps the free 3D scene, presses Escape or reselects the active area.
- [x] Guarantee 44px minimum touch targets and safe-area clearance.

Acceptance: roughly 80–90% of the mobile viewport remains available to the 3D scene in Explore mode.

### Bulk 3 — Detail sheet and project carousel — COMPLETE

- [x] Build the expanded sheet at a maximum of roughly 45% viewport height.
- [x] Add contextual content for Games, Web, Projects and Archive.
- [x] Add a horizontal snap carousel with a visible next-card cue.
- [x] Synchronize carousel selection with Games/Web screens, Projects wall and Archive CRT.
- [x] Integrate project details and external actions through the existing modal.
- [x] Complete keyboard, focus, drag gesture and screen-reader behavior.

Acceptance: project selection is consistent between 2D UI and 3D scene, with no inaccessible touch-only actions.

### Bulk 4 — Context-aware mobile camera choreography — COMPLETE

- [x] Calibrate Portrait presets for every studio area.
- [x] Calibrate Landscape presets for every studio area.
- [x] Offset framing according to collapsed or expanded sheet height.
- [x] Use a compact right-side sheet composition in Landscape.
- [x] Make transitions interruptible and orientation-safe.
- [x] Respect reduced motion.
- [x] Confirm Desktop camera values remain unchanged.

Acceptance: the important physical display remains visible in every state without free-orbit controls.

### Bulk 5 — Mobile production hardening — COMPLETE

- [x] Calibrate mobile pixel ratio, shadows and postprocessing.
- [x] Confirm demand-driven rendering remains effective (maximum 14 idle animation frames per second in automated QA).
- [x] Test image failures, initialization fallback and WebGL context recovery.
- [x] Test Desktop, standard Mobile and constrained Mobile render profiles.
- [x] Test all viewport profiles in the regression matrix.
- [x] Test the production bundle at the GitHub Pages `/basement/` subpath.
- [x] Record Desktop regression isolation and visual browser comparison.

Acceptance: the scene-first mobile UX is deployable and stable on a real phone.

Verification: typecheck, production build, dependency audit, mobile interaction suite, responsive matrix, Pages subpath suite and manual production-build review passed on 2026-09-12. The known Vite warning is limited to the existing Three.js application chunk exceeding 500 kB.

### Decision gate A

- [x] Review the new Mobile UX on the user's phone.
- [x] Compare it with the baseline and concept mockup.
- [x] Approve continuation into the visual environment work.

## Phase B — Games visual prototype

### Bulk 6 — Games art-direction prototype — COMPLETE

- [x] Recompose only the Games area.
- [x] Improve counter, monitor hierarchy and spatial typography.
- [x] Introduce warmer concrete, wood and metal materials.
- [x] Add restrained architectural lighting and selected props.
- [x] Preserve all current Games interactions.

Acceptance: Games is visibly more premium without committing the entire studio to the new direction.

### Bulk 7 — Optimized visual asset pipeline — COMPLETE

- [x] Establish reusable materials and texture budgets.
- [x] Evaluate the prototype's GLB needs and retain a documented procedural-first path.
- [x] Use instancing and cache shared assets.
- [x] Define separate Mobile and Desktop detail budgets.
- [x] Keep robust loading and visual fallbacks as pipeline requirements.

Acceptance: upgraded visuals remain maintainable and performant.

### Bulk 8 — Finalize and benchmark Games — COMPLETE

- [x] Finalize lighting and camera composition.
- [x] Capture before/after comparisons.
- [x] Measure bundle size, load time and runtime performance.
- [x] Test Desktop and both automated Mobile hardware profiles.
- [x] Document deliberate differences from the idealized mockup.

Acceptance: enough evidence exists to decide whether the visual direction should expand.

### Decision gate B

- [x] Continue with the full rollout, as authorized by the user after the verified Games prototype.

## Phase C — Optional full-room rollout

### Bulk 9 — Studio entrance — COMPLETE

- [x] Upgrade central composition, brand wall and orientation cues.

### Bulk 10 — Web area — COMPLETE

- [x] Upgrade the display hierarchy, selection space and area identity.

### Bulk 11 — Projects area — COMPLETE

- [x] Upgrade the project wall and near/far readability.

### Bulk 12 — Archive area — PAUSED

- [ ] Upgrade the CRT/archive atmosphere while preserving overall cohesion.
- [x] Stop before implementation so the stylized rollout does not drift farther from the agreed photorealistic target.

### Bulk 13 — Final integration and release — PAUSED

- [ ] Harmonize transitions, lighting and materials.
- [ ] Complete accessibility and performance acceptance.
- [ ] Complete real-device and Desktop regression QA.
- [ ] Deploy and update project documentation.

The completed Bulks 6–11 are retained as a functional composition/blockout and a safe fallback. Their procedural materials and props are not considered the final photorealistic art pass.

## Phase D — Photorealistic Games proof

### Bulk 14 — Visual target and asset audit — COMPLETE

- [x] Define what “photorealistic” means in measurable visual, technical and performance terms.
- [x] Define a hybrid GLB/PBR pipeline, device budgets and a traceable license register.
- [x] Keep the existing WebGL renderer for the proof instead of combining the art-direction change with a renderer migration.
- [x] Make Games the only visible proof area before another full-room rollout.
- [x] Identify the current fixed Games capture at `docs/qa/current/desktop-1440x900-games.jpg`.
- [x] Generate and preserve three photorealistic reference candidates from the current Games composition.
- [x] Store the approved A/B concept mix as the canonical repository reference.
- [x] Produce a fixed-camera gap audit from the canonical mockup to the current Games capture.
- [x] Select and register the initial external Games sources before they enter the production bundle.

Acceptance: the target, legal provenance, asset shortlist, fixed comparison cameras and performance ceilings are unambiguous before visible scene work begins.

### Decision gate C — Reference approval

- [x] Review and approve the recommended A/B direction as the canonical Games target.
- [x] Approve the initial asset strategy and documented deliberate deviations from the concept.
- [x] Authorize implementation of the photorealistic proof.

No visible 3D replacement begins before Decision Gate C.

### Bulk 15 — Production asset foundation — COMPLETE

- [x] Add a resilient GLTF loading layer with progress, timeout/error fallback, caching and disposal.
- [x] Integrate KTX2/Basis texture transcoding and Meshopt compression with a validated compressed smoke asset.
- [x] Add a validated asset-build step using glTF Transform inspect/validate/optimize.
- [x] Add HDR environment loading with PMREM and a lightweight offline fallback.
- [x] Establish shared PBR material presets, correct color spaces and second-UV handling for AO/lightmaps.
- [x] Keep all new assets lazy and area-scoped so initial navigation remains usable.

Acceptance: one test asset loads, falls back and disposes correctly at the GitHub Pages subpath on every supported profile without changing the visible production scene.

Verification: compressed GLB success/fallback/disposal, HDR fallback, KTX2 runtime delivery, typecheck, production build, Mobile regression suite, dependency audit and GitHub Pages `/basement/` subpath QA passed on 2026-09-12.

### Bulk 16 — Games architectural shell and lighting proof — COMPLETE

- [x] Rebuild only the Games shell at coherent real-world scale.
- [x] Establish the fixed hero camera before detail dressing.
- [x] Establish image-based lighting, exposure and tone mapping.
- [x] Use at most one important shadow-casting light; bake or fake secondary contact/AO where appropriate.
- [x] Preserve every existing Games selection, monitor and navigation interaction.

Acceptance: the empty architectural shell already reads as a believable photographed room, with stable exposure, grounded forms and no interaction regression.

Verification: fixed Desktop/Mobile captures, TypeScript, production build, asset success/fallback/disposal suite, full Mobile interaction/responsive suite and GitHub Pages `/basement/` subpath QA passed on 2026-09-12. The focus-visible furniture and set dressing intentionally remain the Bulk 17 blockout.

### Bulk 17 — Games hero assets and materials — COMPLETE

- [x] Replace focus-visible blockout objects with optimized authored assets.
- [x] Complete the desk, seating, displays, computer hardware and signature props.
- [x] Apply physically plausible concrete, painted metal, wood, glass and emissive display materials.
- [x] Remove floating objects, scale inconsistencies, texture repetition and visibly sharp CG edges.
- [x] Keep branded and screen content local, crisp and accessible.

Acceptance: at the approved fixed Desktop camera, the Games area reaches the reference's material richness, depth and object credibility rather than merely sharing its colors.

Verification: fixed Desktop/Mobile captures, optimized/validated Meshopt plant GLB, production-size WebP materials, generated waterfront backplate, TypeScript and interaction-preserving render checks passed on 2026-09-12. Cross-zone light harmonization remains in Bulk 23; explicit LOD measurement and physical-phone approval are intentionally deferred to Bulk 24.

### Bulk 18 — Games Desktop approval baseline — COMPLETE

- [x] Finalize the visible Games architecture, furniture, props and restrained lighting.
- [x] Improve the window integration and remove obsolete construction ribs.
- [x] Add the approved poster, realistic plants, readable book spines and branded mug.
- [x] Reposition the contextual information card so the hero desk remains visible.
- [x] Capture and review the fixed-camera Desktop result.
- [x] Preserve Mobile standard/low optimization and physical-phone validation for the post-Desktop production pass.

Acceptance: Games is approved by the user as the Desktop quality baseline for expanding the visual language to the rest of the studio.

### Decision gate D — Desktop art-direction approval — COMPLETE

- [x] Approve the fixed-camera Games Desktop proof as an acceptable rollout baseline.
- [x] Authorize expansion of the art direction to the remaining room.
- [x] Explicitly defer Mobile visual refinement until the complete Desktop studio is approved.

## Phase E — Photorealistic Desktop rollout

Desktop is completed and approved before Mobile framing, LOD and device tuning resume. Games remains the visual benchmark and interaction-safe fallback pattern for every following zone.

### Bulk 19 — Shared studio shell and overview — COMPLETE

- [x] Audit the Studio overview at the fixed 1440 × 900 camera and define the intentional hero hierarchy.
- [x] Extend the Games wall, floor, ceiling, window and structural material language across the complete room.
- [x] Resolve visible seams, disconnected wall panels, scale conflicts and placeholder-looking global geometry.
- [x] Establish coherent shared ambient light, exposure and restrained contact grounding without flattening zone identities.
- [x] Upgrade entrance/wayfinding elements only where they remain prominent in the Studio overview.
- [x] Preserve all current navigation targets and zone camera behavior.

Acceptance: the Studio overview reads as one credible interior rather than one finished Games set surrounded by older blockouts.

Commit boundary: shared shell, Studio capture and regression proof only; no detailed Web, Projects or Archive dressing.

Verification: the fixed five-view Desktop capture, TypeScript, production build, complete responsive/interaction suite and GitHub Pages `/basement/` subpath QA passed on 2026-09-12. Mobile continues to load the Games proof only inside Games; the persistent all-room proof is Desktop-only until Bulk 24.

### Bulk 20 — Web workstation — COMPLETE

- [x] Replace the cross-room desk and exposed cable with a wall-integrated product console and floating walnut credenza.
- [x] Improve the architectural surround, edge/contact details and restrained cool Web-area identity.
- [x] Keep the main preview and selector screen content crisp, synchronized and independently clickable.
- [x] Establish a fixed frontal Desktop camera that shows the complete installation without information-card obstruction.
- [x] Physically separate the Web and Projects bays and recenter both focus cameras so their content no longer overlaps.
- [x] Reuse verified materials and assets where plausible instead of introducing near-duplicates.

Acceptance: Web reaches Games-level material credibility and composition while all screen selection and detail actions remain unchanged.

Commit boundary: Web view, its fixed capture and interaction tests.

Verification: fixed five-view Desktop captures, TypeScript, production build, complete responsive/interaction suite and GitHub Pages `/basement/` subpath QA passed on 2026-09-12. The Projects geometry moved only to establish bay separation; its dedicated material/detail pass remains Bulk 21.

### Bulk 21 — Projects gallery

- [x] Upgrade the gallery wall, frame construction, workbench and selection lighting with believable thickness and contact.
- [x] Keep all four project cards legible, interactive and visually dominant.
- [x] Add only a few scale-giving props; avoid turning the gallery into another crowded desk scene.
- [x] Verify hover/selection frames, modal opening and near/far readability.
- [x] Keep the information card clear of the interactive wall.

Acceptance: Projects reads as a premium physical portfolio gallery, not a set of flat cards attached to a procedural panel.

Commit boundary: Projects view, its fixed capture and interaction tests.

Verification: fixed 1440 × 900 before/after captures, production build, complete responsive/interaction suite, explicit Desktop Mirror-modal viewport/close-control regression and GitHub Pages `/basement/` subpath QA passed on 2026-09-12.

### Bulk 22 — Archive and lounge

- [x] Rebuild the shelving, storage boxes, CRT cabinet and lounge furniture with believable silhouettes, bevels and materials.
- [x] Create a warmer, moodier Archive identity using practical/emissive light without breaking shared exposure.
- [x] Ground the sofa, coffee table and secondary props and remove obvious primitive repetition.
- [x] Preserve archive selection, CRT content and project-detail opening.
- [x] Keep the scene readable rather than filling every shelf with expensive unique geometry.

Acceptance: Archive feels intentionally aged and tactile while remaining part of the same studio and preserving every interaction.

Commit boundary: Archive/Lounge view, its fixed capture and interaction tests.

Verification: fixed 1440 × 900 before/after captures, production build, complete responsive/interaction suite, direct Desktop memorial-terminal click regression and GitHub Pages `/basement/` subpath QA passed on 2026-09-12.

### Bulk 22.1 — Archive memorial correction

- [x] Replace the projecting CRT box with one shallow wall-integrated memorial console.
- [x] Increase the cemetery display and keep its physical frame flush and coherent.
- [x] Add a frontal Desktop inspect camera with four individually clickable graves and pointer-driven highlights.
- [x] Preserve direct project-modal opening, Escape/back behavior and Mobile's existing archive flow.
- [x] Remove the obsolete vertical timber slats behind the Archive shelving.

Acceptance: the Archive first reads as a coherent lounge installation, then offers a legible frontal project cemetery without introducing a second 3D environment.

Commit boundary: Archive memorial geometry, inspect interaction, fixed captures and targeted regression tests.

Verification: fixed 1440 × 900 overview and frontal-inspect captures, hover-to-highlight/fourth-grave click regression, return-flow regression, typecheck, production build, complete responsive suite and GitHub Pages `/basement/` subpath QA passed on 2026-09-12.

### Bulk 23 — Desktop integration and approval

- [x] Harmonize zone borders, material scale, exposure, shadows, color temperature and prop density across all five Desktop views.
- [x] Extend the dark PBR cement floor across the complete studio at one consistent material scale.
- [x] Replace the timber-slat ceiling field with a clean recessed ceiling raft and remove obsolete entrance-floor rails, signal buttons and markers.
- [x] Revisit all Desktop camera presets and contextual-card positions only where the upgraded geometry requires it.
- [x] Remove view-specific visibility leaks and confirm transitions never expose unfinished backsides or loading artifacts.
- [x] Capture Studio, Games, Web, Projects and Archive at 1440 × 900 and compare them as one visual set.
- [x] Run typecheck, production build, interaction tests, GitHub Pages subpath checks and Desktop visual regression QA.
- [x] Record deferred cosmetic ideas separately so the approved rollout does not become an endless polish loop.

Acceptance: all five Desktop views meet the Games baseline, feel like one designed environment and are explicitly approved before Mobile work resumes.

Verification: five-view fixed 1440 × 900 before/after set, responsive viewport matrix through 1920 × 1080, complete interaction suite, typecheck, production build and GitHub Pages `/basement/` subpath QA passed on 2026-09-12. Final visual approval remains Decision gate E.

### Bulk 23.1 — Adaptive Desktop sharpness

- [x] Capture current 1.55× Desktop performance and visual baselines at representative 1080p and HiDPI sizes.
- [x] Raise Desktop rendering toward 2× device pixel ratio with a simple 8.3-megapixel (native 4K) drawing-buffer ceiling for 4K/ultrawide windows.
- [x] Keep antialiasing, shadows and bloom calibrated; do not change Mobile quality profiles.
- [x] Compare the measured p95 transition/render interval with the 1.55× baseline and document the headless GPU limitation against the nominal 22 ms hardware budget.
- [x] Compare all five views and camera transitions for sharper edges without shimmer, stalls or excessive memory use.

Acceptance: supported Desktop hardware receives visibly sharper geometry and text without destabilizing navigation or weaker laptops.

Commit boundary: adaptive Desktop renderer policy, benchmarks and fixed visual evidence.

Verification: 1440 × 900 HiDPI now receives 2× resolution (5.18 MP, +66.5% pixels), 1080p HiDPI reaches the 8.29 MP native-4K ceiling and 1440p HiDPI is safely capped at 1.5×/8.29 MP. Mobile remains exactly 1.1×/1×. Five-view 2880 × 1800 before/after captures, relative warmed-transition benchmark, idle-render budget, complete responsive/interaction suite, production build and Pages subpath QA passed on 2026-09-12.

### Bulk 23.1a — Games selection handoff

- [x] After a selection on the left Game Select monitor, transition to the selected project on the main monitor.
- [x] Add an explicit `← GAME SELECT` return path; Escape follows the same hierarchy before returning to Games overview.
- [x] Keep direct main-monitor detail opening and existing Mobile controls working.

Acceptance: choosing a game always produces an immediately visible project result rather than leaving the selected screen out of frame.

Verification: Desktop Game Select → Core Arena → main-preview → project-modal flow, both return steps, Escape hierarchy, existing Mobile selection controls, typecheck, production build and complete responsive UI suite passed on 2026-09-13.

### Bulk 23.2 — Focus-aware screen fidelity

- [x] Make live-screen resolution configurable instead of globally fixed at 768 × 432.
- [x] Render the focal screen in the active Desktop zone (and the inspected screen) at 1536 × 864 while distant/non-focal screens retain the efficient base resolution.
- [x] Audit project-image source dimensions and retain the best available originals rather than fabricating detail through offline upscaling.
- [x] Audit close-up PBR surfaces; the existing tiled 1K sets remain sufficient at the approved cameras, so no unjustified 2K payload was added.
- [x] Verify hover, selection, project opening, asset fallbacks and Archive/Games inspect views at both screen resolutions.
- [x] Repeat the complete Desktop visual set, responsive tests, production build and Pages subpath QA.

Acceptance: close-up displays and major surfaces reach a perceived 9/10 Desktop sharpness while background work remains performance-conscious.

Commit boundary: focus-aware screen resolution, selective asset upgrades and final sharpness/performance evidence.

Verification: focal Desktop canvases switch from 768 × 432 to 1536 × 864 (4× pixels) while Mobile and non-focal screens remain unchanged. Resolution-state interaction tests, source audit, five-view/close-up visual review, GPU-safe resize regression, responsive suite, production build, benchmark and Pages subpath QA passed on 2026-09-13.

### Bulk 23.3 — Photoreal hero models

- [x] Replace the Archive's procedural sofa with a licensed, textured two-seat model on Desktop.
- [x] Replace the Games keyboard and mouse primitives with one licensed PBR input-device set.
- [x] Remove visible USB cable clutter, restrain RGB emission and preserve the existing procedural geometry as the Mobile/load-failure fallback.
- [x] Optimize both source downloads into compact Meshopt/WebP runtime GLBs and keep original packages out of the production repository.
- [x] Record creator, license, source URL, original/runtime checksums and every material/geometry presentation change.
- [x] Verify Games and Archive at 1440 × 900 plus the complete Desktop/Mobile interaction matrix, production build, asset QA and Pages subpath.

Acceptance: the most visually exposed furniture and desk-input primitives read as authored products rather than rounded boxes, with no interaction regression or unjustified Mobile payload.

Commit boundary: optimized model assets, Desktop placement/fallback logic, attribution, fixed captures and regressions.

Verification: targeted 1280 × 800 and 1440 × 900 Games/Archive reviews, Desktop model-load and Mobile fallback assertions, complete interaction/responsive suite, asset runtime QA, production build and GitHub Pages `/basement/` subpath QA passed on 2026-09-13.

### Decision gate E — Complete Desktop approval

- [ ] Approve the five-view Desktop set.
- [ ] Freeze Desktop composition except for verified Mobile-compatible fixes.
- [ ] Authorize the final Mobile and production-hardening phase.

## Phase F — Mobile adaptation and production release

### Bulk 24 — Mobile composition, LOD and real-device pass

- [ ] Reframe every completed zone for portrait, landscape, collapsed sheet and expanded sheet states.
- [ ] Create explicit Desktop, Mobile standard and Mobile low asset/texture tiers.
- [ ] Validate scene visibility, information density, tap targets and project selection on a physical phone.
- [ ] Measure deferred transfer, triangles, draw calls, memory and p95 transition/render frame time against the documented budgets.
- [ ] Verify asset failure, slow loading, WebGL recovery and reduced-motion behavior.

Acceptance: Mobile presents the same finished studio with deliberate framing and production-safe detail levels, not a separate or visually reduced website.

### Bulk 25 — Release candidate, deployment and documentation

- [ ] Run the complete Desktop/Mobile/browser regression matrix and dependency audit.
- [ ] Verify the production bundle under the GitHub Pages `/basement/` subpath.
- [ ] Update asset provenance, architecture notes, captures and final roadmap status.
- [ ] Deploy the approved commit and perform a live Pages smoke test.

Acceptance: the approved visual redesign is reproducible, documented, deployed and recoverable.

## Working agreement

At the end of every bulk:

1. Update this roadmap and its checkboxes.
2. Run the complete acceptance checks for that bulk.
3. Review the diff for accidental Desktop changes.
4. Commit the bulk as one coherent checkpoint.
5. Push the working branch only after validation succeeds.

The original Games prototype did not begin before Decision Gate A, and the original rollout did not begin before Decision Gate B. From this revision onward, visible photorealistic Games work must not begin before Decision Gate C, and no other zone may receive that treatment before Decision Gate D.
