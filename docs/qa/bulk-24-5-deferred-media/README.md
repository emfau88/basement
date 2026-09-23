# Bulk 24.5 — Deferred project media

This pass reduces startup image transfer and decode pressure without changing the approved final scene.

## Measured cold-load project media

| Metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Startup project image transfer | 2.12 MB | 0.85 MB | −60% |
| Estimated decoded project bitmap memory | 86.6 MB | ~34 MB | −61% |
| Project files requested before photoreal proof completes | 19 full images | 6 required full images + 4 previews | Deferred remainder |

The headless renderer's absolute completion time remains dominated by the unchanged 4.53 MB photoreal Games asset set and software GPU compilation, so this bulk does not claim a stable end-to-end time reduction. Its verified gains are lower startup transfer, fewer simultaneous decodes and substantially lower early bitmap memory.

## Quality policy

- Games and Web start with the currently visible full-resolution artwork.
- Archive loads all four full images because every grave is visible and interactive.
- The Project Wall starts with exact 768 × 432 card-sized previews and upgrades to the original full images when Projects becomes active.
- Mobile cards use previews; detail modals retain the original full images.
- Background slideshow prefetch begins only after the photoreal proof finishes.

## Verification

- Production build and TypeScript validation
- Complete Desktop/Mobile interaction and responsive matrix
- GitHub Pages subpath and project-image loading QA
- Live Studio before/after-load inspection
- Active Project Wall sharpness inspection
