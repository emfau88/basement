# Bulk 24.1 — Mobile camera endpoints and composition

Date: 2026-09-14

## Scope

This pass corrects Mobile endpoint framing only. Desktop camera presets and scene geometry remain unchanged. Mobile Standard visual asset parity follows in Bulk 24.2; safe central waypoints for long cross-room moves are intentionally deferred to Bulk 24.3.

## Result

- Studio and Games use deliberate portrait and landscape overview distances.
- Web now follows the approved frontal Desktop subject axis and no longer looks through the central workstation.
- Projects is frontal and separated from the neighboring Web installation in the landscape composition.
- Archive now frames the lounge, memorial screen and shelving instead of the obsolete rear-wall target.
- Expanded sheets retain the same subject area while moving the useful scene content away from the overlay.

## Visual matrix

The directory contains matching `before-*` and `after-*` JPEGs for:

- portrait `390 × 844`
- landscape `740 × 430`
- Studio
- Games, Web, Projects and Archive with collapsed and expanded sheets

Representative comparisons:

- [Web portrait before](before-portrait-390x844-web-collapsed.jpg) / [after](after-portrait-390x844-web-collapsed.jpg)
- [Archive portrait before](before-portrait-390x844-archive-collapsed.jpg) / [after](after-portrait-390x844-archive-collapsed.jpg)
- [Projects landscape before](before-landscape-740x430-projects-collapsed.jpg) / [after](after-landscape-740x430-projects-collapsed.jpg)
- [Archive landscape before](before-landscape-740x430-archive-collapsed.jpg) / [after](after-landscape-740x430-archive-collapsed.jpg)

## Verification

- TypeScript and production build
- complete Mobile responsive/interaction QA
- GitHub Pages `/basement/` subpath QA
- browser-console and page-error checks during the capture matrix
