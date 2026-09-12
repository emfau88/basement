# EMFAU Virtual Studio

EMFAU Virtual Studio is a bright, interactive 3D portfolio for games, apps and archived experiments. The room itself is the navigation: fixed camera compositions move between the main studio, Games, Web, Projects and Archive stations.

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

The Vite development server prints the local URL. Remote project screenshots require a network connection; unavailable images fall back without stopping the studio.

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
- `src/scene/` contains the renderer, shared materials/geometries and the procedural room.
- `src/screens/` renders the animated CanvasTextures and the physical Projects wall.
- `src/interaction/` contains hotspots and raycast behavior.
- `src/ui/` controls navigation, mobile selectors and the accessible project modal.
- `src/audio/` owns the optional user-triggered ambient sound.
- `src/performance/` schedules 60 FPS camera transitions and approximately 11 FPS screen redraws without a permanent full-speed render loop.

## Add or edit a project

Edit `src/data/projects.ts`. A project entry contains its text, image URL, links, screen label and `display` calibration. Add its ID to the appropriate ordered list (`gameProjectKeys`, `webProjectKeys`, `archiveProjectKeys` or `featuredProjectKeys`) to place it on a physical screen.

Bright screenshots should be calibrated per project with `brightness`, `saturation` and `contrast`; do not compensate by changing global room lighting.

## Change a camera view

Edit `src/camera/presets.ts`. Desktop, mobile and Games-selector inspect views are kept separate. `src/camera/cameraController.ts` applies transitions and respects `prefers-reduced-motion`.

## GitHub Pages

The workflow at `.github/workflows/deploy-pages.yml` builds `dist/` and deploys that artifact on pushes to `main` or through a manual run. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.

No server, API or secrets are required.
