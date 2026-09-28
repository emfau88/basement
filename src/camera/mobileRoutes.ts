import type { StudioView } from '../state/studioState'

export type MobileRouteProfile = 'portrait' | 'landscape'
export type MobileRouteFamily = 'direct' | 'left-arc' | 'right-arc'

export interface MobileRoutePlan {
  family: MobileRouteFamily
  /** Preserve the verified waypoint choreography until Bulk 25.3. */
  useLegacyWaypoint: boolean
}

type RoomLane = 'left' | 'center' | 'right'
type RoomDepth = 'overview' | 'back' | 'front'

interface RoomZone {
  lane: RoomLane
  depth: RoomDepth
}

const roomZones: Record<StudioView, RoomZone> = {
  studio: { lane: 'center', depth: 'overview' },
  games: { lane: 'center', depth: 'back' },
  web: { lane: 'right', depth: 'back' },
  projects: { lane: 'right', depth: 'front' },
  archive: { lane: 'left', depth: 'front' },
}

const routeFamilyFor = (from: StudioView, to: StudioView, distance: number): MobileRouteFamily => {
  if (from === to) return 'direct'
  const source = roomZones[from]
  const destination = roomZones[to]
  const sharesLane = source.lane === destination.lane
  const sharesFrontCorridor = source.depth === 'front' && destination.depth === 'front' && distance <= 7
  if ((sharesLane || sharesFrontCorridor) && distance <= 7) return 'direct'
  return source.lane === 'left' || destination.lane === 'left' ? 'left-arc' : 'right-arc'
}

/**
 * Selects one of three reusable route families from room topology instead of
 * maintaining a growing list of view-pair exceptions. Bulk 25.2 intentionally
 * keeps the verified staged waypoint execution; Bulk 25.3 will consume the
 * arc family as a continuous curve.
 */
export function getMobileRoutePlan(
  from: StudioView,
  to: StudioView,
  distance: number,
  profile: MobileRouteProfile,
): MobileRoutePlan {
  const family = routeFamilyFor(from, to, distance)
  const useLegacyWaypoint = profile === 'portrait'
    ? family !== 'direct'
    : to !== 'studio' && distance > 7
  return { family, useLegacyWaypoint }
}
