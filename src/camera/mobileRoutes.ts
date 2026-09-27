import type { StudioView } from '../state/studioState'

export type MobileRouteProfile = 'portrait' | 'landscape'

const routedViaStudioHub = new Set<string>([
  'studio:web',
  'studio:projects',
  'studio:archive',
  'web:studio',
  'projects:studio',
  'archive:studio',
  'games:web',
  'games:projects',
  'games:archive',
  'web:games',
  'projects:games',
  'archive:games',
  'web:archive',
  'archive:web',
])

/**
 * Mobile portrait and landscape share the same semantic room routes. Their
 * endpoint composition stays independent in presets.ts.
 */
export function shouldUseMobileHub(
  from: StudioView,
  to: StudioView,
  distance: number,
  profile: MobileRouteProfile,
): boolean {
  if (from === to) return false
  // Landscape remains the verified Bulk 24.3 comparison baseline until its
  // dedicated rotation/pass in the next step.
  if (profile === 'landscape') return to !== 'studio' && distance > 7
  return distance > 7 || routedViaStudioHub.has(`${from}:${to}`)
}
