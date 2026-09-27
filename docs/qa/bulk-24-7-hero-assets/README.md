# Bulk 24.7 — Hero asset optimization

This pass reduces GPU texture pressure and transfer size without changing the approved geometry or composition.

## Exact asset results

| Asset | File before | File after | GPU textures before | GPU textures after | Render vertices |
| --- | ---: | ---: | ---: | ---: | ---: |
| Keyboard + mouse | 714,876 B | 393,416 B | ~78.3 MB | ~11.2 MB | 75,792 unchanged |
| Potted plant | 888,380 B | 670,496 B | ~33.6 MB | ~8.4 MB | 208,035 unchanged |
| Combined | 1,603,256 B | 1,063,912 B | ~111.9 MB | ~19.6 MB | unchanged |

The input-device source retains the cable and connector meshes. Existing runtime visibility remains unchanged. Mouse color textures already discarded by runtime styling and textures belonging to the hidden connector are pruned; remaining visible textures are Lanczos3-resampled from 1024px to 512px. The plant receives only the same conservative texture resize.

## Visual acceptance

Fixed `1440 × 900 @ 2x` captures were compared at native output size:

| Comparison | Mean absolute channel difference | Channels differing by more than 8/255 |
| --- | ---: | ---: |
| Keyboard + mouse detail | 0.153/255 | 0.46% |
| Plant detail | 0.249/255 | 0.36% |
| Full Games view after plant pass | 0.171/255 | 0.36% |

The remaining differences are dominated by normal render and dust-particle variation. Manual inspection confirms unchanged silhouettes, legibility, leaf masks, veins, pot detail, placement and scale.

## Runtime measurement policy

Three full benchmark passes were taken (before, after input devices, after plants). Most high-resolution and Mobile Standard profiles improved, while one Desktop profile fluctuated in the opposite direction because the headless browser uses software GPU compilation. No stable end-to-end time percentage is claimed. The exact file-size and GPU-allocation reductions above are deterministic.

## Verification

- Production build and TypeScript validation
- GLB inspection and validation against preserved sources
- Asset foundation QA
- Complete Desktop/Mobile interaction and responsive matrix
- GitHub Pages `/basement/` subpath QA
- Fixed-camera capture and pixel comparison
