import { isMobileViewport } from '../config/responsive'

export interface RenderQualityProfile {
  name: 'desktop' | 'mobile-standard' | 'mobile-low'
  antialias: boolean
  bloom: boolean
  bloomStrength: number
  pixelRatioCap: number
  screenIntervalMs: number
  shadows: boolean
}

type DeviceNavigator = Navigator & { deviceMemory?: number }

export function resolveRenderQuality(): RenderQualityProfile {
  if (!isMobileViewport()) {
    return { name: 'desktop', antialias: true, bloom: true, bloomStrength: 0.15, pixelRatioCap: 1.55, screenIntervalMs: 90, shadows: true }
  }
  const memory = (navigator as DeviceNavigator).deviceMemory
  const cores = navigator.hardwareConcurrency
  const constrained = (memory !== undefined && memory <= 4) || (cores !== undefined && cores <= 4)
  return constrained
    ? { name: 'mobile-low', antialias: false, bloom: false, bloomStrength: 0, pixelRatioCap: 1, screenIntervalMs: 140, shadows: false }
    : { name: 'mobile-standard', antialias: true, bloom: true, bloomStrength: 0.1, pixelRatioCap: 1.1, screenIntervalMs: 110, shadows: true }
}
