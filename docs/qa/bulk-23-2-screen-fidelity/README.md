# Bulk 23.2 — Focus-aware screen fidelity

Desktop monitor canvases are no longer fixed globally at 768 × 432. The visually dominant screen in the active area now renders at 1536 × 864, while distant and non-focal screens stay at the efficient base resolution. Game Select and the selected-game preview exchange the high-resolution budget as focus moves. Web uses high resolution for both working screens, Projects for the four active cards, and Archive for the memorial display. Mobile remains 768 × 432.

Changing the backing size explicitly recreates the GPU texture storage. This prevents partial texture uploads into stale dimensions and was verified by the console-clean fixed-capture run.

## Source-image audit

| Use | Available sources | Decision |
| --- | --- | --- |
| Games | 1280 × 670–800 | Retain originals; the new canvas materially sharpens generated type and overlays. A modest image upscale is preferable to fabricating detail. |
| Web | 464–1080 × 688–2412 portrait sources | Sufficient for the 436 × 604 maximum image region at 2×. |
| Projects | 1080–1280 px wide | Retain originals; no higher-resolution repository sources exist. |
| Archive | 1280 px wide | More than sufficient for the grave image regions, including inspect view. |
| Large PBR surfaces | Existing tiled 1024² concrete, walnut and rug sets | Fixed-camera review showed no material-limited close-up that justified a 2K payload. No artificial upscale was added. |

## Performance evidence

The headless GPU benchmark remains a relative regression signal rather than physical-GPU frame-rate evidence. With the focused screen active, the warmed Games transition measured 177.9 / 230.7 / 227.9 ms p95 at 1440 × 900, 1080p and 1440p HiDPI respectively. Samples are sparse on the headless renderer, but all profiles completed, Mobile remained at 22.2 / 5.6 ms, and demand-driven idle rendering stayed at 5–9 frames per second against the 14-frame ceiling.

## Visual evidence

The five `after-*` captures are the complete 2880 × 1800 Desktop set. `close-game-select`, `close-game-preview` and `close-archive-inspect` verify the three closest monitor views. The Bulk 23.1 `after-*` captures are the matching pre-change reference.

## Verification

- Resolution-state assertions for Games overview, Game Select, selected-game preview, Web, Projects, Archive and Mobile
- Selection, hover, modal, return-path, fallback-image and WebGL recovery regression tests
- TypeScript typecheck and production build
- Complete responsive viewport matrix
- Five-view fixed Desktop capture with browser-console validation
- HiDPI/backbuffer benchmark and unchanged Mobile quality assertions
- GitHub Pages `/basement/` subpath QA
