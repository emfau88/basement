# Mobile camera audit — 2026-09-14

## Finding

The current Mobile presets predate parts of the completed Desktop room rollout. They still move correctly at runtime, but several endpoints frame old geometry or use a different viewing axis from the approved Desktop composition.

| View | Current Mobile result | Recommended correction |
| --- | --- | --- |
| Studio | Central Games desk is readable, but large ceiling/floor bands consume portrait space and the side zones disappear. | Keep a central orientation shot, crop ceiling/floor, and retain visible edge cues toward Web/Projects and Archive rather than attempting to fit the whole Desktop panorama. |
| Games | Correct frontal family, but too much ceiling/floor and insufficient priority on monitors plus input surface. | Preserve the Desktop frontal axis and target hierarchy; move back enough for portrait width and frame the monitor/desk band in the upper scene-safe area. |
| Web | Oblique preset still reflects the former workstation layout. | Match the approved Desktop wall-normal/frontal axis, show both screens and the complete console, and use distance instead of extreme FOV to fit portrait width. |
| Projects | Frontal direction is broadly correct, but cards are cropped and the 64–68° FOV exaggerates perspective. | Keep the Desktop wall-normal axis, dolly farther back, reduce distortion, and keep all four cards visible above the sheet. |
| Archive | Targets the shelving/empty wall instead of the current lounge and memorial composition. | Reuse the Desktop composition target around the lounge/memorial, move back for portrait, and keep both the cemetery display and sofa as the identifying pair. |

## Choreography recommendation

1. Share the Desktop subject targets and primary viewing axes with Mobile.
2. Author Mobile distance, height and FOV separately for portrait and landscape.
3. Replace long straight cross-room interpolation with a safe central pull-back waypoint, then approach the destination on its approved axis. This prevents cameras travelling through furniture or exposing unfinished backsides.
4. Keep sheet expansion within the same viewing axis. Recompose toward the unobstructed upper viewport without changing the identity of the shot.
5. Treat selector/cemetery close-ups as a second level with an explicit return to the same area overview.
6. Validate collapsed, expanded and transition midpoint captures at 390 × 844, 430 × 932 and 740 × 430, followed by a physical-phone review.

## Guardrails

- Do not copy Desktop coordinates verbatim into portrait view.
- Avoid very wide portrait FOV as a substitute for sufficient camera distance.
- Do not add free-orbit controls.
- Keep Desktop presets and composition unchanged.
- Preserve current Mobile sheets, project selection and performance tiers.
