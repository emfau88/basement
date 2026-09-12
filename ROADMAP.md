# EMFAU Virtual Studio roadmap

Last updated: 2026-09-12  
Current phase: Phase A — Mobile UX  
Current bulk: Bulk 2 — Compact navigation and collapsed sheet

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

### Bulk 2 — Compact navigation and collapsed sheet — **IN PROGRESS**

- [ ] Replace large mobile cards with a compact fixed navigation.
- [ ] Add the collapsed contextual sheet above navigation.
- [ ] Model explicit `collapsed` and `expanded` states.
- [ ] Collapse when the user taps the free 3D scene.
- [ ] Guarantee 44px minimum touch targets and safe-area clearance.

Acceptance: roughly 80–90% of the mobile viewport remains available to the 3D scene in Explore mode.

### Bulk 3 — Detail sheet and project carousel

- [ ] Build the expanded sheet at a maximum of roughly 45% viewport height.
- [ ] Add contextual content for Games, Web, Projects and Archive.
- [ ] Add a horizontal project carousel with a visible next-card cue.
- [ ] Synchronize carousel selection with the physical 3D screens.
- [ ] Integrate project details and external actions.
- [ ] Complete keyboard, focus and screen-reader behavior.

Acceptance: project selection is consistent between 2D UI and 3D scene, with no inaccessible touch-only actions.

### Bulk 4 — Context-aware mobile camera choreography

- [ ] Calibrate Portrait presets for every studio area.
- [ ] Calibrate Landscape presets for every studio area.
- [ ] Offset framing according to collapsed or expanded sheet height.
- [ ] Make transitions interruptible and orientation-safe.
- [ ] Respect reduced motion.
- [ ] Confirm Desktop camera values remain unchanged.

Acceptance: the important physical display remains visible in every state without free-orbit controls.

### Bulk 5 — Mobile production hardening

- [ ] Calibrate mobile pixel ratio, shadows and postprocessing.
- [ ] Confirm demand-driven rendering remains effective.
- [ ] Test image failures and WebGL fallback.
- [ ] Test all profiles in the regression matrix.
- [ ] Test the actual GitHub Pages subpath deployment.
- [ ] Record Desktop regression comparison.

Acceptance: the scene-first mobile UX is deployable and stable on a real phone.

### Decision gate A

- [ ] Review the new Mobile UX on the user's phone.
- [ ] Compare it with the baseline and concept mockup.
- [ ] Approve or revise before visual environment work starts.

## Phase B — Games visual prototype

### Bulk 6 — Games art-direction prototype

- [ ] Recompose only the Games area.
- [ ] Improve counter, monitor hierarchy and spatial typography.
- [ ] Introduce warmer concrete, wood and metal materials.
- [ ] Add restrained architectural lighting and selected props.
- [ ] Preserve all current Games interactions.

Acceptance: Games is visibly more premium without committing the entire studio to the new direction.

### Bulk 7 — Optimized visual asset pipeline

- [ ] Establish reusable materials and texture budgets.
- [ ] Add a GLB loading path only if the prototype needs it.
- [ ] Use instancing and cache shared assets.
- [ ] Define separate Mobile and Desktop detail budgets.
- [ ] Add robust loading fallbacks.

Acceptance: upgraded visuals remain maintainable and performant.

### Bulk 8 — Finalize and benchmark Games

- [ ] Finalize lighting and camera composition.
- [ ] Capture before/after comparisons.
- [ ] Measure bundle size, load time and runtime performance.
- [ ] Test Desktop and real Mobile hardware.
- [ ] Document deliberate differences from the idealized mockup.

Acceptance: enough evidence exists to decide whether the visual direction should expand.

### Decision gate B

- [ ] Choose full rollout, reduced rollout or selected-area adoption.

## Phase C — Optional full-room rollout

### Bulk 9 — Studio entrance

- [ ] Upgrade central composition, brand wall and orientation cues.

### Bulk 10 — Web area

- [ ] Upgrade the display hierarchy, selection space and area identity.

### Bulk 11 — Projects area

- [ ] Upgrade the project wall and near/far readability.

### Bulk 12 — Archive area

- [ ] Upgrade the CRT/archive atmosphere while preserving overall cohesion.

### Bulk 13 — Final integration and release

- [ ] Harmonize transitions, lighting and materials.
- [ ] Complete accessibility and performance acceptance.
- [ ] Complete real-device and Desktop regression QA.
- [ ] Deploy and update project documentation.

## Working agreement

At the end of every bulk:

1. Update this roadmap and its checkboxes.
2. Run the complete acceptance checks for that bulk.
3. Review the diff for accidental Desktop changes.
4. Commit the bulk as one coherent checkpoint.
5. Push the working branch only after validation succeeds.

The visual Games prototype must not begin before Decision Gate A. The remaining studio must not be redesigned before Decision Gate B.
