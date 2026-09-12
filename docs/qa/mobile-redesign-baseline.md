# Mobile redesign baseline

Captured from commit `c5d9b52` before the scene-first mobile redesign.

## Recovery points

- Published baseline commit: `c5d9b525df4f00781fc7e4d426e3b37f1baa0866`
- Remote backup branch: `backup/pre-mobile-redesign-2026-09-12`
- Working branch: `mobile/scene-first-ux`

The backup branch must never receive redesign commits. It is the recoverable pre-redesign state.

## Canonical responsive boundary

- Mobile: viewport width `<= 760px`
- Desktop: viewport width `>= 761px`
- TypeScript source: `src/config/responsive.ts`
- CSS mirror: media queries in `src/styles/responsive.css`

CSS media queries cannot consume a TypeScript constant, so both locations carry an explicit synchronization comment.

## Baseline camera presets

| View | Desktop position | Desktop target | FOV | Mobile position | Mobile target | FOV |
| --- | --- | --- | ---: | --- | --- | ---: |
| Studio | `0.18, 3.55, 10.35` | `0.30, 1.48, -1.90` | 48 | `0.26, 4.00, 12.30` | `0.50, 1.72, -1.70` | 54 |
| Games | `-0.10, 2.48, 3.35` | `-0.05, 1.55, -3.48` | 40 | `-0.12, 2.32, 2.15` | `-0.04, 1.56, -3.46` | 34 |
| Web | `2.05, 2.34, -3.02` | `5.15, 1.63, -3.02` | 33 | `2.42, 2.18, -3.02` | `5.32, 1.60, -3.02` | 29 |
| Projects | `2.48, 2.40, 0.74` | `7.02, 2.42, 0.72` | 37 | `2.20, 2.38, 0.74` | `7.02, 2.42, 0.72` | 64 |
| Archive | `-2.65, 2.48, 2.12` | `-5.45, 1.58, -4.03` | 40 | `-3.05, 2.26, 1.36` | `-5.50, 1.56, -4.02` | 35 |
| Game selector | `-1.10, 2.00, -0.95` | `-1.48, 1.92, -3.27` | 27 | `-0.72, 2.03, 0.18` | `-1.58, 1.92, -3.27` | 43 |

## Baseline UI behavior

- Desktop uses the full information card and five-item bottom navigation.
- Mobile uses the same navigation with reduced spacing.
- Games exposes a `Select game` action on mobile.
- Web exposes a two-column mobile project selector.
- Projects centers a compact information card over the wall.
- Escape closes a project modal, exits selector inspection, or returns to Studio in that order.
- Project and monitor selection are backed by the shared studio store.

## Reference captures

The `baseline/` directory contains all five views at:

- Desktop: `1440 × 900`
- Mobile: `390 × 844`
- Mobile: `430 × 932`

Regenerate only after an explicitly accepted visual baseline change:

```powershell
npm run qa:capture-baseline -- --force
```

## Regression matrix

| Profile | Views | Required checks |
| --- | --- | --- |
| 360 × 800 portrait | All | No overflow, safe touch targets, usable sheet |
| 390 × 844 portrait | All | Primary phone reference |
| 412 × 915 portrait | All | Android reference |
| 430 × 932 portrait | All | Large-phone reference |
| Mobile landscape | All | No clipped controls, stable camera |
| Tablet portrait | All | Breakpoint transition remains coherent |
| 1366 × 768 desktop | All | No desktop visual regression |
| 1440 × 900 desktop | All | Screenshot baseline |
| 1920 × 1080 desktop | All | Wide desktop composition |

Every bulk must also pass typecheck, production build, a clean browser console, keyboard navigation and `prefers-reduced-motion` behavior.
