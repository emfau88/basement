import type { MobileSheetState, StudioView } from '../state/studioState'
import { isLandscapeViewport, isMobileViewport } from '../config/responsive'

export type VectorTuple = readonly [number, number, number]

export interface CameraPreset {
  position: VectorTuple
  target: VectorTuple
  fov: number
}

export const desktopCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.18, 3.55, 10.35], target: [0.3, 1.48, -1.9], fov: 48 },
  games: { position: [-0.12, 3, 4.05], target: [-0.05, 1.82, -3.5], fov: 42 },
  web: { position: [2.15, 2.72, -3.88], target: [7.02, 2.52, -3.88], fov: 50 },
  projects: { position: [2.18, 2.72, 2.05], target: [7.02, 2.55, 2.05], fov: 41 },
  archive: { position: [-2.28, 2.7, 3.38], target: [-6.42, 1.48, -1.18], fov: 50 },
}

export const mobilePortraitCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.26, 4, 12.3], target: [0.5, 1.72, -1.7], fov: 54 },
  games: { position: [-0.08, 3.1, 5.25], target: [-0.04, 1.76, -3.46], fov: 62 },
  web: { position: [1.4, 3, 1.6], target: [5.62, 1.82, -3.06], fov: 64 },
  projects: { position: [2.2, 2.38, 1.65], target: [7.02, 2.42, 1.65], fov: 64 },
  archive: { position: [-3.05, 2.26, 1.36], target: [-5.5, 1.56, -4.02], fov: 35 },
}

export const mobilePortraitExpandedCameraPresets: Record<StudioView, CameraPreset> = {
  studio: mobilePortraitCameraPresets.studio,
  games: { position: [-0.08, 3.1, 5.25], target: [-0.04, 1.08, -3.46], fov: 64 },
  web: { position: [1.4, 3, 1.6], target: [5.62, 1.04, -3.06], fov: 66 },
  projects: { position: [2.2, 2.38, 1.65], target: [7.02, 1.62, 1.65], fov: 68 },
  archive: { position: [-3.05, 2.26, 1.36], target: [-5.5, 0.58, -4.02], fov: 40 },
}

export const mobileLandscapeCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.2, 3.62, 10.7], target: [0.35, 1.54, -1.82], fov: 51 },
  games: { position: [-0.05, 2.84, 3.72], target: [-0.18, 1.78, -3.48], fov: 44 },
  web: { position: [1.9, 2.82, .35], target: [5.58, 1.82, -3.06], fov: 48 },
  projects: { position: [2.42, 2.4, 1.65], target: [7.02, 2.34, 1.65], fov: 46 },
  archive: { position: [-2.8, 2.4, 1.82], target: [-5.45, 1.54, -4.03], fov: 45 },
}

export const mobileLandscapeExpandedCameraPresets: Record<StudioView, CameraPreset> = {
  studio: mobileLandscapeCameraPresets.studio,
  games: { ...mobileLandscapeCameraPresets.games, target: [-0.65, 1.2, -3.48], fov: 46 },
  web: { ...mobileLandscapeCameraPresets.web, target: [5.58, 1.16, -3.06], fov: 51 },
  projects: { ...mobileLandscapeCameraPresets.projects, target: [7.02, 1.58, 1.65], fov: 51 },
  archive: { ...mobileLandscapeCameraPresets.archive, target: [-5.45, 0.62, -4.03], fov: 50 },
}

export const inspectCameraPresets = {
  gameSelector: {
    desktop: { position: [-1.34, 2.12, -0.56], target: [-1.77, 1.91, -3.28], fov: 28 },
    portrait: { position: [-.66, 2.14, .76], target: [-1.77, 1.91, -3.28], fov: 43 },
    landscape: { position: [-.92, 2.1, -.12], target: [-1.77, 1.91, -3.28], fov: 34 },
  },
} as const

export function getViewPreset(view: StudioView, sheet: MobileSheetState = 'collapsed'): CameraPreset {
  if (!isMobileViewport()) return desktopCameraPresets[view]
  if (isLandscapeViewport()) return (sheet === 'expanded' ? mobileLandscapeExpandedCameraPresets : mobileLandscapeCameraPresets)[view]
  return (sheet === 'expanded' ? mobilePortraitExpandedCameraPresets : mobilePortraitCameraPresets)[view]
}

export function getInspectPreset(): CameraPreset {
  if (!isMobileViewport()) return inspectCameraPresets.gameSelector.desktop
  return inspectCameraPresets.gameSelector[isLandscapeViewport() ? 'landscape' : 'portrait']
}
