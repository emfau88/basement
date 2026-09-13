import * as THREE from 'three'
import type { StudioMaterials } from '../materials'
import type { SceneTools } from '../primitives'
import type { SceneDetailBudget } from '../assets/detailBudget'

export interface GamesZoneMeshes {
  gameMainScreen: THREE.Mesh
  gameLeftScreen: THREE.Mesh
  gameRightScreen: THREE.Mesh
}

function createGameLabSignMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('games:game-lab-sign', 1024, 256, (context, canvas) => {
    context.fillStyle = '#171a18'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#d7b768'
    context.fillRect(42, 36, 126, 8)
    context.fillStyle = '#f1eee4'
    context.font = '900 92px Arial'
    context.fillText('GAME LAB', 40, 148)
    context.fillStyle = '#aeb7ad'
    context.font = '700 25px monospace'
    context.fillText('01  /  PLAY · TEST · SHIP', 44, 205)
  })
  return new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: 0xffffff,
    emissiveIntensity: 0.48,
    roughness: 0.42,
    metalness: 0.12,
  })
}

export function buildGamesZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): GamesZoneMeshes {
  const { addBox, addCylinder, addInstances, group, point, screen } = tools
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8b66b,
    emissive: 0xd8a957,
    emissiveIntensity: 1.15,
    roughness: 0.32,
    metalness: 0.18,
  })
  const statusMaterial = new THREE.MeshStandardMaterial({
    color: 0x9bb37d,
    emissive: 0x9bb37d,
    emissiveIntensity: 1,
    roughness: 0.25,
  })

  // A restrained architectural portal gives the Games station its own identity
  // while keeping the central window and sight line through the studio intact.
  const portal = group('GamesPortal', [0, 0, -6.02])
  addBox(portal, [6.56, .24, .26], [0, 4.48, 0], materials.concreteDark, [0, 0, 0], .035)
  for (const x of [-3.16, 3.16]) {
    addBox(portal, [.24, 3.46, .24], [x, 2.75, 0], materials.concreteDark, [0, 0, 0], .035)
  }
  addInstances(portal, 'GamesPortalRibs', [.38, .065, .12], [-3.16, 3.16].flatMap((x) =>
    Array.from({ length: 5 }, (_, index) => ({ position: [x, 1.32 + index * .63, .16] as const })),
  ), materials.oakDark, .018)
  addBox(portal, [3.74, .47, .08], [0, 4.77, .12], createGameLabSignMaterial(tools), [0, 0, 0], .025)

  // Warm layered counter: oak worktop, dark structural frame and a fine light reveal.
  const desk = group('MainDesk', [0, 0, -3.45])
  addBox(desk, [5.26, .19, 1.55], [0, 1.1, 0], materials.oakDark, [0, 0, 0], .065)
  addBox(desk, [5.04, .08, 1.35], [0, .98, 0], materials.graphite, [0, 0, 0], .035)
  addBox(desk, [4.78, .15, .12], [0, .88, .68], materials.concreteDark, [0, 0, 0], .025)
  addBox(desk, [4.48, .025, .035], [0, .99, .77], glowMaterial, [0, 0, 0], .012)
  for (const x of [-2.16, 2.16]) {
    addBox(desk, [.14, 1.02, .14], [x, .49, -.5], materials.graphite, [0, 0, x < 0 ? -.045 : .045], .022)
    addBox(desk, [.14, 1.02, .14], [x, .49, .5], materials.graphite, [0, 0, x < 0 ? -.045 : .045], .022)
  }
  addBox(desk, [4.34, .12, .31], [0, 1.36, -.37], materials.concreteDark, [0, 0, 0], .028)
  addBox(desk, [3.98, .025, .035], [0, 1.42, -.2], glowMaterial, [0, 0, 0], .012)

  // One dominant display with lower, inward-facing companion monitors.
  const mainMonitor = group('MainMonitor', [0, 0, -3.46])
  const gameMainScreen = screen(mainMonitor, 2.28, 1.24, [0, 2.15, -.27], 'EMFAU', 'game studio', '#bda45c')
  addBox(mainMonitor, [.085, .72, .085], [0, 1.55, -.31], materials.graphite)
  addBox(mainMonitor, [.82, .055, .32], [0, 1.29, -.28], materials.graphite, [0, 0, 0], .025)

  const leftMonitor = group('LeftMonitor', [-1.78, -.02, -3.31], [0, .2, 0])
  const gameLeftScreen = screen(leftMonitor, 1.22, .76, [0, 1.91, -.19], 'PLAY', 'games / builds', '#bda45c')
  addBox(leftMonitor, [.065, .55, .065], [0, 1.49, -.23], materials.graphite)
  addBox(leftMonitor, [.56, .045, .26], [0, 1.26, -.2], materials.graphite, [0, 0, 0], .02)

  const rightMonitor = group('RightMonitor', [1.78, -.02, -3.31], [0, -.2, 0])
  const gameRightScreen = screen(rightMonitor, 1.22, .76, [0, 1.91, -.19], 'SHIP', 'release / test', '#bda45c')
  addBox(rightMonitor, [.065, .55, .065], [0, 1.49, -.23], materials.graphite)
  addBox(rightMonitor, [.56, .045, .26], [0, 1.26, -.2], materials.graphite, [0, 0, 0], .02)

  // Input devices and tactile props keep the station readable at close range.
  const legacyKeyboardDeck = addBox(desk, [1.72, .055, .39], [-.34, 1.23, .44], materials.black, [0, 0, 0], .025)
  legacyKeyboardDeck.name = 'LegacyKeyboardDeck'
  addInstances(desk, 'LegacyKeyboardKeys', [.105, .02, .09], Array.from({ length: 10 }, (_, index) => ({
    position: [-1.01 + index * .14, 1.265, .44] as const,
  })), materials.graphite2, .008)
  const legacyMouse = addBox(desk, [.25, .035, .34], [.76, 1.24, .47], materials.black, [0, 0, 0], .04)
  legacyMouse.name = 'LegacyMouse'
  const controller = group('GameController', [1.28, 1.22, -2.98], [.02, 0, 0])
  addBox(controller, [.58, .11, .3], [0, 0, 0], materials.graphite, [0, 0, 0], .08)
  addCylinder(controller, .055, .055, .08, [-.14, .08, .02], materials.black, [Math.PI / 2, 0, 0], 18)
  addCylinder(controller, .055, .055, .08, [.14, .08, .02], materials.black, [Math.PI / 2, 0, 0], 18)
  for (const [x, z] of [[-.18, -.08], [.18, -.08]] as const) addBox(controller, [.05, .025, .05], [x, .07, z], statusMaterial, [0, 0, 0], .012)

  // Ventilated tower and a compact single monitor speaker.
  addBox(desk, [.62, 1.08, .68], [2.02, .55, -.06], materials.concreteDark, [0, 0, 0], .05)
  addBox(desk, [.47, .72, .022], [2.02, .59, .292], materials.glass, [0, 0, 0], .02)
  for (let index = 0; index < 3; index += 1) addBox(desk, [.032, .032, .018], [1.87 + index * .12, .98, .31], index === 0 ? statusMaterial : glowMaterial, [0, 0, 0], .008)
  addBox(desk, [.34, .58, .32], [2.06, 1.54, -.05], materials.black, [0, 0, 0], .04)
  addCylinder(desk, .11, .11, .025, [2.06, 1.55, .12], materials.graphite2, [Math.PI / 2, 0, 0], 24)

  const lamp = group('DeskLamp', [-2.28, 0, -3.78])
  addCylinder(lamp, .035, .05, .67, [0, 1.5, 0], materials.graphite)
  addBox(lamp, [.44, .075, .21], [.12, 1.83, 0], materials.brass, [0, 0, -.18], .025)

  if (budget.decorativeLights) {
    point(0xe3b66d, 1.05, 3.2, [-2.48, 1.98, -4.42])
    point(0xe3b66d, .78, 3.1, [2.5, 1.84, -4.35])
  }

  return { gameMainScreen, gameLeftScreen, gameRightScreen }
}
