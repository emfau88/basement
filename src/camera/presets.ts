import type { InspectMode, MobileSheetState, StudioView } from '../state/studioState'
import { isLandscapeViewport, isMobileViewport } from '../config/responsive'

export type VectorTuple = readonly [number, number, number]

export interface CameraPreset {
  position: VectorTuple
  target: VectorTuple
  fov: number
}

export const desktopCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.18, 3.55, 10.35], target: [0.3, 1.48, -1.9], fov: 48 },
  // Slightly elevated sightline keeps the input devices readable above the
  // chair back without losing the frontal workstation composition.
  games: { position: [-0.12, 3.22, 4.05], target: [-0.05, 1.68, -3.5], fov: 42 },
  web: { position: [2.15, 2.72, -3.88], target: [7.02, 2.52, -3.88], fov: 50 },
  projects: { position: [2.18, 2.72, 2.05], target: [7.02, 2.55, 2.05], fov: 41 },
  archive: { position: [-2.28, 2.7, 3.38], target: [-6.42, 1.48, -1.18], fov: 50 },
}

export const mobilePortraitCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.18, 3.45, 10.4], target: [0.3, 1.9, -2], fov: 50 },
  games: { position: [-0.12, 3.15, 6.9], target: [-0.05, 1.82, -3.5], fov: 52 },
  // Stay in front of the central workstation. Portrait framing is widened via
  // FOV instead of pulling the camera through foreground geometry.
  web: { position: [1.7, 2.82, -3.88], target: [7.02, 1.95, -3.88], fov: 88 },
  projects: { position: [-1, 2.8, 2.05], target: [7.02, 2.55, 2.05], fov: 58 },
  archive: { position: [-0.2, 3.2, 5.4], target: [-6.42, 1.48, -1.18], fov: 58 },
}

export const mobilePortraitExpandedCameraPresets: Record<StudioView, CameraPreset> = {
  studio: mobilePortraitCameraPresets.studio,
  games: { ...mobilePortraitCameraPresets.games, target: [-0.05, 1.25, -3.5], fov: 54 },
  web: { ...mobilePortraitCameraPresets.web, target: [7.02, 1.5, -3.88], fov: 90 },
  projects: { ...mobilePortraitCameraPresets.projects, target: [7.02, 1.85, 2.05], fov: 60 },
  archive: { ...mobilePortraitCameraPresets.archive, target: [-6.42, .9, -1.18], fov: 60 },
}

export const mobileLandscapeCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.2, 3.55, 10.7], target: [0.3, 1.7, -1.9], fov: 50 },
  games: { position: [-0.05, 3.05, 4.5], target: [-0.05, 1.8, -3.5], fov: 44 },
  web: { position: [1.7, 2.72, -3.88], target: [7.02, 2.52, -3.88], fov: 50 },
  projects: { position: [2.18, 2.72, 2.65], target: [7.02, 2.52, 2.65], fov: 43 },
  archive: { position: [-2, 2.65, 3.7], target: [-6.42, 1.48, -1.18], fov: 50 },
}

export const mobileLandscapeExpandedCameraPresets: Record<StudioView, CameraPreset> = {
  studio: mobileLandscapeCameraPresets.studio,
  games: { ...mobileLandscapeCameraPresets.games, position: [-.05, 3.05, 5.05], target: [-.05, 1.25, -3.5], fov: 46 },
  web: { ...mobileLandscapeCameraPresets.web, position: [1.7, 2.72, -3.25], target: [7.02, 1.85, -3.25], fov: 52 },
  projects: { ...mobileLandscapeCameraPresets.projects, target: [7.02, 1.82, 2.65], fov: 46 },
  archive: { ...mobileLandscapeCameraPresets.archive, position: [-1.72, 2.72, 4.02], target: [-6.2, .95, -.72], fov: 52 },
}

export function getMobileTransitionWaypoint(): CameraPreset {
  return isLandscapeViewport()
    ? { position: [0.2, 3.55, 8.5], target: [0.2, 1.75, -1.8], fov: 52 }
    : { position: [0.2, 3.5, 9.5], target: [0.2, 1.9, -1.9], fov: 54 }
}

export const inspectCameraPresets = {
  gameSelector: {
    desktop: { position: [-1.34, 2.12, -0.56], target: [-1.77, 1.91, -3.28], fov: 28 },
    portrait: { position: [-.66, 2.14, .76], target: [-1.77, 1.91, -3.28], fov: 43 },
    landscape: { position: [-.92, 2.1, -.12], target: [-1.77, 1.91, -3.28], fov: 34 },
  },
  gamePreview: {
    desktop: { position: [0, 2.82, -.46], target: [0, 2.15, -3.73], fov: 33 },
    portrait: { position: [0, 2.15, .46], target: [0, 2.15, -3.73], fov: 51 },
    landscape: { position: [0, 2.15, -.08], target: [0, 2.15, -3.73], fov: 39 },
  },
  archiveCemetery: {
    desktop: { position: [-3.82, 2.15, -1.08], target: [-7.28, 2.15, -1.08], fov: 34 },
    portrait: { position: [-3.4, 2.15, -1.08], target: [-7.28, 2.15, -1.08], fov: 72 },
    landscape: { position: [-3.7, 2.15, -1.08], target: [-7.28, 2.15, -1.08], fov: 36 },
  },
} as const

export function getViewPreset(view: StudioView, sheet: MobileSheetState = 'collapsed'): CameraPreset {
  if (!isMobileViewport()) return desktopCameraPresets[view]
  if (isLandscapeViewport()) return (sheet === 'expanded' ? mobileLandscapeExpandedCameraPresets : mobileLandscapeCameraPresets)[view]
  return (sheet === 'expanded' ? mobilePortraitExpandedCameraPresets : mobilePortraitCameraPresets)[view]
}

export function getInspectPreset(mode: Exclude<InspectMode, null>): CameraPreset {
  if (!isMobileViewport()) return inspectCameraPresets[mode].desktop
  return inspectCameraPresets[mode][isLandscapeViewport() ? 'landscape' : 'portrait']
}
