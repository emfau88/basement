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
  games: { position: [-0.1, 2.48, 3.35], target: [-0.05, 1.55, -3.48], fov: 40 },
  web: { position: [2.05, 2.34, -3.02], target: [5.15, 1.63, -3.02], fov: 33 },
  projects: { position: [2.48, 2.4, 0.74], target: [7.02, 2.42, 0.72], fov: 37 },
  archive: { position: [-2.65, 2.48, 2.12], target: [-5.45, 1.58, -4.03], fov: 40 },
}

export const mobilePortraitCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.26, 4, 12.3], target: [0.5, 1.72, -1.7], fov: 54 },
  games: { position: [-0.12, 2.32, 2.15], target: [-0.04, 1.56, -3.46], fov: 34 },
  web: { position: [2.42, 2.18, -3.02], target: [5.32, 1.6, -3.02], fov: 29 },
  projects: { position: [2.2, 2.38, 0.74], target: [7.02, 2.42, 0.72], fov: 64 },
  archive: { position: [-3.05, 2.26, 1.36], target: [-5.5, 1.56, -4.02], fov: 35 },
}

export const mobilePortraitExpandedCameraPresets: Record<StudioView, CameraPreset> = {
  studio: mobilePortraitCameraPresets.studio,
  games: { position: [-0.12, 2.32, 2.15], target: [-0.04, 1.1, -3.46], fov: 36 },
  web: { position: [2.42, 2.18, -3.02], target: [5.32, 1.15, -3.02], fov: 32 },
  projects: { position: [2.2, 2.38, 0.74], target: [7.02, 1.62, 0.72], fov: 68 },
  archive: { position: [-3.05, 2.26, 1.36], target: [-5.5, 0.58, -4.02], fov: 40 },
}

export const mobileLandscapeCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.2, 3.62, 10.7], target: [0.35, 1.54, -1.82], fov: 51 },
  games: { position: [-0.1, 2.45, 3.05], target: [-0.05, 1.52, -3.48], fov: 42 },
  web: { position: [2.18, 2.32, -3.02], target: [5.18, 1.58, -3.02], fov: 40 },
  projects: { position: [2.42, 2.4, 0.74], target: [7.02, 2.34, 0.72], fov: 46 },
  archive: { position: [-2.8, 2.4, 1.82], target: [-5.45, 1.54, -4.03], fov: 45 },
}

export const mobileLandscapeExpandedCameraPresets: Record<StudioView, CameraPreset> = {
  studio: mobileLandscapeCameraPresets.studio,
  games: { ...mobileLandscapeCameraPresets.games, target: [-0.05, 1.1, -3.48], fov: 44 },
  web: { ...mobileLandscapeCameraPresets.web, target: [5.18, 1.12, -3.02], fov: 42 },
  projects: { ...mobileLandscapeCameraPresets.projects, target: [7.02, 1.58, 0.72], fov: 51 },
  archive: { ...mobileLandscapeCameraPresets.archive, target: [-5.45, 0.62, -4.03], fov: 50 },
}

export const inspectCameraPresets = {
  gameSelector: {
    desktop: { position: [-1.1, 2, -0.95], target: [-1.48, 1.92, -3.27], fov: 27 },
    portrait: { position: [-0.72, 2.03, 0.18], target: [-1.58, 1.92, -3.27], fov: 43 },
    landscape: { position: [-0.9, 2.02, -0.38], target: [-1.52, 1.92, -3.27], fov: 34 },
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
