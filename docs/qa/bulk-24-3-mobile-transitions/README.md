# Bulk 24.3 — Mobile transitions and Archive inspection

Date: 2026-09-15

## Result

- Long Mobile moves pass through a central pull-back view instead of cutting directly through room geometry.
- Short moves, sheet reframing and all Desktop camera behavior remain direct and unchanged.
- Reduced-motion mode skips the staged route.
- Archive exposes `View project cemetery` in its Mobile sheet.
- Tapping the physical Archive terminal also enters the same frontal inspection.
- Entering an inspection collapses the Mobile sheet; `Archive Lounge` returns to the approved overview.
- The complete Cemetery frame and all four graves fit in portrait and landscape.

## Evidence

Each orientation has captures for the safe waypoint, Archive overview, Cemetery inspection and lounge return:

- `portrait-390x844-*`
- `landscape-740x430-*`

Automated Mobile QA verifies the Archive action, inspect state, sheet collapse, return label and exit behavior.
