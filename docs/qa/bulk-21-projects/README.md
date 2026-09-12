# Bulk 21 — Projects gallery QA

Verified on 2026-09-12.

## Visual changes

- Recentered the four cards so they sit fully inside the gallery backing.
- Retained the terracotta strips as restrained inset edge rails instead of allowing cards to overlap them.
- Added thinner physical card carriers, brighter self-lit artwork and a softer top-biased practical light.
- Reworked the three workbench boxes into static `BUILD / BREAK / SHIP` process blocks.
- Reduced the black carrier edge and made the active hover frame fully cover it.
- Constrained the project detail shell independently from source-image aspect ratio so the portrait Mirror artwork cannot push the dialog or close control outside the viewport.

## Evidence

- `before-desktop-1440x900.jpg`
- `after-desktop-1440x900.jpg`

## Checks

- `npm run build`
- `npm run qa:mobile`
- `npm run qa:pages`
- Live in-app browser verification of the Mirror card, close control and focus restoration

All checks passed. The remaining Vite chunk-size notice is the already documented Three.js bundle warning.
