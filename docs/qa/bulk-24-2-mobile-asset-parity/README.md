# Bulk 24.2 — Mobile Standard asset parity

Date: 2026-09-14

## Result

- Mobile Standard uses the licensed fabric sofa, PBR plants, keyboard and mouse already approved on Desktop.
- These shared hero objects stay active across Studio, Games and Archive instead of reverting after navigation.
- Mobile Low retains lightweight procedural replacements and defers the Games proof until Games is opened.
- Desktop behavior and assets are unchanged.

The plant file is requested twice as two scene instances, but the asset manager downloads and parses it once through its model cache.

## Evidence

- [Mobile Standard Studio](standard-studio.jpg)
- [Mobile Standard Games](standard-games.jpg)
- [Mobile Standard Archive](standard-archive.jpg)

Automated Mobile QA verifies `desktop-ready` hero assets on Mobile Standard and `procedural-fallback` on Mobile Low.
