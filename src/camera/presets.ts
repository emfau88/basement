import type { StudioView } from '../state/studioState'

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

export const mobileCameraPresets: Record<StudioView, CameraPreset> = {
  studio: { position: [0.26, 4, 12.3], target: [0.5, 1.72, -1.7], fov: 54 },
  games: { position: [-0.12, 2.32, 2.15], target: [-0.04, 1.56, -3.46], fov: 34 },
  web: { position: [2.42, 2.18, -3.02], target: [5.32, 1.6, -3.02], fov: 29 },
  projects: { position: [2.2, 2.38, 0.74], target: [7.02, 2.42, 0.72], fov: 64 },
  archive: { position: [-3.05, 2.26, 1.36], target: [-5.5, 1.56, -4.02], fov: 35 },
}

export const inspectCameraPresets = {
  gameSelector: {
    desktop: { position: [-1.1, 2, -0.95], target: [-1.48, 1.92, -3.27], fov: 27 },
    mobile: { position: [-0.72, 2.03, 0.18], target: [-1.58, 1.92, -3.27], fov: 43 },
  },
} as const

export const isMobileViewport = () => window.innerWidth < 760

export function getViewPreset(view: StudioView): CameraPreset {
  return (isMobileViewport() ? mobileCameraPresets : desktopCameraPresets)[view]
}

export function getInspectPreset(): CameraPreset {
  return inspectCameraPresets.gameSelector[isMobileViewport() ? 'mobile' : 'desktop']
}
