# Bulk 23.1 — Adaptive Desktop sharpness

Desktop rendering now targets up to 2× device pixel ratio with an 8.29-megapixel native-4K drawing-buffer ceiling. This improves common Retina/HiDPI windows without allowing very large or ultrawide viewports to allocate an unbounded render surface. Mobile policies remain unchanged.

## Measured render policy

| Profile | Before | After | Pixel change | Warm transition p95 before → after | Idle frames before → after |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1440 × 900 @2× | 3.11 MP / 1.55× | 5.18 MP / 2× | +66.5% | 130.4 → 141.6 ms | 10 → 8 |
| 1920 × 1080 @2× | 4.98 MP / 1.55× | 8.29 MP / 2× | +66.5% | 150.1 → 172.1 ms | 7 → 7 |
| 2560 × 1440 @2× | 8.86 MP / 1.55× | 8.29 MP / 1.5× | −6.3% | 197.3 → 205.6 ms | 6 → 7 |
| Mobile standard | 0.40 MP / 1.1× | unchanged | 0% | — | unchanged |
| Mobile low | 0.33 MP / 1× | unchanged | 0% | — | unchanged |

The automated browser uses a headless GPU path whose absolute Desktop frame intervals already exceeded the nominal 22 ms hardware target at the unchanged baseline. These values are therefore relative regression evidence, not a claim about a physical GPU. The common HiDPI profiles gained 66.5% pixels for an 8.6–14.7% p95 interval increase, while demand-driven idle rendering remained within its 14-frame budget.

## Visual evidence

The five `before-*` and `after-*` files are matching 2880 × 1800 captures for Studio, Games, Web, Projects and Archive.

## Verification

- TypeScript typecheck and production build
- Three Desktop HiDPI/backbuffer profiles
- Exact unchanged Mobile pixel-ratio assertions
- Complete responsive and interaction suite
- Five-view visual review and live transition inspection
- GitHub Pages `/basement/` subpath QA
