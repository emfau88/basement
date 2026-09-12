# EMFAU Virtual Studio roadmap

Last updated: 2026-09-12  
Current phase: Phase B — Games visual prototype
Current bulk: Bulk 11 — Projects area

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

### Bulk 11 — Projects area — **IN PROGRESS**

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
