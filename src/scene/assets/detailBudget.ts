import type { RenderQualityProfile } from '../../performance/deviceProfile'

export interface SceneDetailBudget {
  cityBuildings: number
  cylinderSegments: number
  decorativeLights: boolean
  dustParticles: number
  plantLeafSegments: readonly [number, number]
  roundedBoxSegments: number
  textureAnisotropy: number
}

const budgets: Record<RenderQualityProfile['name'], SceneDetailBudget> = {
  desktop: {
    cityBuildings: 26,
    cylinderSegments: 24,
    decorativeLights: true,
    dustParticles: 160,
    plantLeafSegments: [18, 12],
    roundedBoxSegments: 5,
    textureAnisotropy: 4,
  },
  'mobile-standard': {
    cityBuildings: 18,
    cylinderSegments: 18,
    decorativeLights: true,
    dustParticles: 96,
    plantLeafSegments: [14, 9],
    roundedBoxSegments: 4,
    textureAnisotropy: 2,
  },
  'mobile-low': {
    cityBuildings: 12,
    cylinderSegments: 12,
    decorativeLights: false,
    dustParticles: 48,
    plantLeafSegments: [10, 7],
    roundedBoxSegments: 3,
    textureAnisotropy: 1,
  },
}

export function resolveSceneDetailBudget(profile: RenderQualityProfile): SceneDetailBudget {
  return budgets[profile.name]
}
