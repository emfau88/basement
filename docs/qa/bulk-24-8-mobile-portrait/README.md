# Bulk 24.8 — Mobile camera audit and portrait correction

Date: 2026-09-27

## Scope and guardrails

This pass audits the current finished room and corrects the `390 × 844` portrait experience. Desktop presets, Desktop camera behavior, scene geometry and landscape endpoints remain unchanged. Landscape keeps its verified Bulk 24.3 routing behavior until the dedicated orientation/rotation pass.

## Step 1 — Audit and route structure

| State | Audit result | Action |
| --- | --- | --- |
| Studio | Correct central orientation shot; the physical width cannot fit into portrait without destructive fisheye distortion. | Retained. |
| Games | Correct frontal axis, but the desk and input surface were slightly too distant. | Brought the portrait endpoint closer with a narrower lens. |
| Web | Complete console was present, but unnecessary wall space sat above it. | Kept the collision-safe position and shifted the target upward in the usable viewport. |
| Projects | All cards fit, but the close 58° shot stretched the wall edges and sat low. | Moved back, narrowed the lens and raised the wall composition. |
| Archive | Lounge, memorial and shelving already formed a clear identifying group. | Retained. |
| Games/Cemetery inspect | Functional, but the portrait close-ups used wider lenses than necessary. | Matched the previous subject width from farther away with less perspective distortion. |

Mobile routes are now decided in `src/camera/mobileRoutes.ts` instead of by an isolated distance check inside the controller. Portrait cross-zone moves use the safe central hub for explicit room pairs and as a distance fallback. Reduced motion remains direct. Landscape retains its previous routing rule for comparison, and Desktop never enters the Mobile route branch.

## Step 2 — Portrait result

- Games gives the monitors, keyboard and mouse more readable scale without losing the complete desk.
- Web and Projects occupy the upper scene-safe area instead of leaving a large unused wall band above the subject.
- Projects uses a longer camera distance and a 54° lens instead of the former close 58° composition.
- Games selector, main preview and Archive cemetery use longer-distance, narrower-lens close-ups.
- Expanded sheets keep the same subject axis and move only the framing needed to preserve visible 3D context.

## Evidence

The directory contains matching PNG captures for the portrait overview states:

- `before/after-studio.png`
- `before/after-games.png` and `before/after-games-expanded.png`
- `before/after-web.png` and `before/after-web-expanded.png`
- `before/after-projects.png` and `before/after-projects-expanded.png`
- `before/after-archive.png` and `before/after-archive-expanded.png`
- `before/after-games-selector.png`
- `before/after-archive-cemetery.png`
- portrait safe-route midpoint captures for Web → Archive and Archive → Studio

## Verification

- TypeScript validation
- production build
- complete Desktop/Mobile interaction and responsive QA
- GitHub Pages `/basement/` subpath QA
- source diff review confirming unchanged Desktop and landscape preset values
- manual `390 × 844` review of collapsed, expanded and inspect states

