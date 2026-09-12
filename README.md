# EMFAU Virtual Studio

EMFAU Virtual Studio is an interactive 3D portfolio for games, apps and archived experiments. The room itself is the navigation: calibrated camera compositions move between Studio, Games, Web, Projects and Archive. Each area combines procedural geometry, PBR materials, live project screens and accessible HTML project details.

The interaction model takes conceptual inspiration from [Basement Studio](https://basement.studio/), especially its separation of scenes, camera state and inspectable objects. This repository remains an independent, deliberately smaller Three.js implementation without React, Next.js or React Three Fiber.

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
- `src/camera/` contains desktop/mobile/inspect presets and camera transitions.
- `src/scene/` contains the renderer, asset pipeline, PBR materials and modular procedural room zones.
- `src/screens/` renders the animated CanvasTextures and the physical Projects wall.
- `src/interaction/` contains hotspots and raycast behavior.
- `src/ui/` controls navigation, mobile selectors and the accessible project modal.
- `src/audio/` owns the optional user-triggered ambient sound.
- `src/performance/` schedules 60 FPS camera transitions and approximately 11 FPS screen redraws without a permanent full-speed render loop.

## Add or edit a project

Edit `src/data/projects.ts`. A project entry contains its text, image URL, links, screen label and `display` calibration. Add its ID to the appropriate ordered list (`gameProjectKeys`, `webProjectKeys`, `archiveProjectKeys` or `featuredProjectKeys`) to place it on a physical screen.

Bright screenshots should be calibrated per project with `brightness`, `saturation` and `contrast`; do not compensate by changing global room lighting.

## Change a camera view

Edit `src/camera/presets.ts`. Desktop, mobile, Games-selector and Archive-memorial inspect views are kept separate. `src/camera/cameraController.ts` applies transitions and respects `prefers-reduced-motion`.

## Desktop rendering quality

Desktop uses antialiasing, shadows, restrained bloom and up to `2×` device pixel ratio, capped at an 8.3-megapixel native-4K drawing buffer for very large HiDPI/ultrawide windows. Live in-world screens render at `768 × 432`; this keeps interaction smooth but is intentionally below maximum Retina/4K sharpness. PBR surface textures use anisotropic filtering to remain stable at oblique camera angles.

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
