# Bulk 22 — Archive and lounge QA

Verified on 2026-09-12.

## Visual changes

- Replaced the deep placeholder shelf with a wall-aligned walnut and dark-steel archive system.
- Replaced twelve repeated boxes with a restrained set of labelled archive cases, books and a reel detail.
- Built one larger vintage memorial terminal with a dedicated walnut cabinet and physical controls.
- Reworked the live Archive screen into a four-project `PROJECT CEMETERY`; the active grave remains the project opened on click.
- Rebuilt the sofa with layered fabric cushions, matte frame, feet and seams.
- Rebuilt the coffee table and added a warm floor lamp, lounge artwork and practical lighting.
- Widened and recentered the fixed Archive camera so terminal, shelving and lounge read as one area.
- Compacted the contextual Archive card so it no longer hides the environment.

## Evidence

- `before-desktop-1440x900.jpg`
- `after-desktop-1440x900.jpg`

## Checks

- `npm run build`
- `npm run qa:mobile`
- `npm run qa:pages`
- Direct Desktop click regression for the memorial terminal and project modal

All checks passed. The remaining Vite chunk-size notice is the already documented Three.js bundle warning.
