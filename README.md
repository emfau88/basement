# EMFAU Virtual Studio

EMFAU Virtual Studio is an interactive 3D portfolio for games, apps and archived experiments. The room itself is the navigation: calibrated camera compositions move between Studio, Games, Web, Projects and Archive. Each area combines procedural geometry, licensed hero models, PBR materials, live project screens and accessible HTML project details.

The interaction model takes conceptual inspiration from [Basement Studio](https://basement.studio/), especially its separation of scenes, camera state and inspectable objects. This repository remains an independent, deliberately smaller Three.js implementation without React, Next.js or React Three Fiber.

The current curated catalog contains nine selectable games, five Web Lab apps, four featured Projects-wall entries and four retired Archive projects. Featured additions from the wider EMFAU catalog include Rooster Rage, More Than Wombat, Terra Divina, Galalaxy, Strategy Galalaxy, MewTrack and MarschLegenden; Voidline: Farhaven is intentionally presented as an archived prototype.

## Stack

- Vite 8
- TypeScript
- Three.js 0.186.0
- DOM and CSS

## Development

```bash
npm install
npm run dev
```

The Vite development server prints the local URL. Unavailable project images fall back without stopping the studio.

## Production build

```bash
npm run build
npm run preview
```

The static build is written to `dist/`. `vite.config.ts` uses a relative base path so the result also works below a GitHub Pages repository path.

## Architecture

- `src/main.ts` composes the application and owns the top-level back hierarchy.
- `src/data/projects.ts` is the single source of truth for titles, images, links, metadata and per-project display calibration.
- `src/state/studioState.ts` stores the current view, inspect mode, project selections and open modal.
- `src/camera/` contains separate desktop, mobile and inspect presets plus staged Mobile transition routes.
- `src/scene/` contains the renderer, asset pipeline, PBR materials and modular procedural room zones.
- `src/screens/` renders the animated CanvasTextures and the physical Projects wall.
- `src/interaction/` contains hotspots and raycast behavior.
- `src/ui/` controls navigation, mobile selectors and the accessible project modal.
- `src/audio/` owns the optional user-triggered ambient sound.
- `src/performance/` schedules 60 FPS camera transitions and approximately 11 FPS screen redraws without a permanent full-speed render loop.

## Add or edit a project

Edit `src/data/projects.ts`. A project entry contains its text, image URL, links, screen label and `display` calibration. Add its ID to the appropriate ordered list (`gameProjectKeys`, `webProjectKeys`, `archiveProjectKeys` or `featuredProjectKeys`) to place it on a physical screen.

Bright screenshots should be calibrated per project with `brightness`, `saturation` and `contrast`; do not compensate by changing global room lighting.

Project media is stored locally under `public/assets/projects/`. New hero captures are retained as high-quality WebP and AVIF derivatives; WebP is the compatibility-safe runtime source used by the CanvasTexture screens.

## Change a camera view

Edit `src/camera/presets.ts`. Desktop, portrait, landscape, Games-selector and Archive-Cemetery views are kept separate. `src/camera/cameraController.ts` applies direct or safe staged transitions and respects `prefers-reduced-motion`.

## Desktop rendering quality

Desktop uses antialiasing, shadows, restrained bloom and up to `2×` device pixel ratio, capped at an 8.3-megapixel native-4K drawing buffer for very large HiDPI/ultrawide windows. The focal live screen renders at `1536 × 864`; distant and Mobile screens stay at the efficient `768 × 432` base resolution. PBR surface textures use anisotropic filtering to remain stable at oblique camera angles.

Third-party visual assets and their licenses are documented in [`public/assets/photoreal/LICENSES.md`](public/assets/photoreal/LICENSES.md); checksums and production modifications are tracked in [`docs/architecture/asset-register.md`](docs/architecture/asset-register.md).

## Mobile rendering quality

Mobile uses the same studio and project data with dedicated portrait/landscape compositions, a compact project sheet and touch-friendly inspection controls. Long cross-room moves use a clear central waypoint, and Archive includes a frontal Project Cemetery view with a return to the lounge.

`Mobile Standard` shares the licensed sofa, plants, keyboard and mouse used on Desktop, while reducing expensive rendering effects. Devices with at most 4 GB reported memory or four CPU cores switch to `Mobile Low`, which keeps the complete interaction model but uses lightweight procedural replacements and a lower rendering budget.

## Quality checks

```bash
npm run typecheck
npm run build
npm run qa:mobile
npm run qa:pages
npm run qa:capture-current
```

The responsive suite also exercises Desktop breakpoints, project interactions, inspect modes, asset fallbacks and WebGL recovery. Fixed visual evidence and the active implementation sequence live in `docs/qa/` and `ROADMAP.md`.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds `dist/` and deploys that artifact on pushes to `main` or through a manual run. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

No server, API or secrets are required.
