# Bulk 8 — Games benchmark

Captured: 2026-09-12  
Command: `npm run qa:benchmark`  
Runtime: local production bundle in headless Microsoft Edge, device scale factor 2, reduced motion enabled

Third-party traffic is blocked during this benchmark so it measures the shipped application rather than internet latency. All twelve project previews are now self-hosted WebP assets and therefore continue to load during the run.

## Bundle and media

| Asset group | Raw bytes | Gzip bytes |
| --- | ---: | ---: |
| Application JavaScript | 885,435 | 265,476 |
| Application CSS | 18,434 | 4,930 |
| 12 project previews | 778,212 | Already compressed WebP |

The original downloaded previews totalled roughly 8.7 MB. Normalizing them to maximum 1280px WebP reduced the self-hosted media payload by roughly 91% without changing project content.

## Runtime profiles

| Profile | Viewport | Studio ready | Idle frames / second | Backbuffer pixels | Scene detail |
| --- | --- | ---: | ---: | ---: | ---: |
| Desktop | 1440 × 900 | 3,926 ms | 9 | 3,113,640 | 160 |
| Mobile standard | 390 × 844 | 2,791 ms | 9 | 398,112 | 96 |
| Mobile low | 390 × 844 | 2,683 ms | 7 | 329,160 | 48 |

These local timings are regression markers, not promises for every device. The automated acceptance threshold is the demand-driven idle budget of no more than 14 animation frames per second. Final physical-phone validation remains part of the release gate in Bulk 13.

## Visual comparison

The same-viewport before/after captures are stored in `docs/qa/bulk-6-games/`. The result deliberately preserves the bright overall studio language while giving Games a stronger dark portal, warm counter, spatial label and dominant central screen. It does not attempt photorealism or add a heavy 3D asset download.
