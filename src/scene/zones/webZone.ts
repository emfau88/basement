import * as THREE from 'three'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { StudioMaterials } from '../materials'
import type { SceneTools } from '../primitives'

export interface WebZoneMeshes {
  webMainScreen: THREE.Mesh
  webSideScreen: THREE.Mesh
}

function webLabMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('web:web-lab-sign', 1024, 256, (context, canvas) => {
    context.fillStyle = '#e8e7e1'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#72a5b4'; context.fillRect(40, 34, 124, 8)
    context.fillStyle = '#19211f'; context.font = '900 84px Arial'; context.fillText('WEB LAB', 40, 143)
    context.fillStyle = '#64716d'; context.font = '700 24px monospace'; context.fillText('02  /  DESIGN · BUILD · SHIP', 43, 201)
  })
  return new THREE.MeshStandardMaterial({ map: texture, roughness: .7, metalness: .03 })
}

export function buildWebZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): WebZoneMeshes {
  const { addBox, addCylinder, box, group, point, screen } = tools
  const blueGlow = new THREE.MeshStandardMaterial({
    color: 0x79a9b7,
    emissive: 0x6d9dab,
    emissiveIntensity: 1.05,
    roughness: .32,
    metalness: .12,
  })

  box('WebRug', [3.55, .025, 2.4], [5.62, .018, -3.05], materials.rug, [0, 0, 0], false, true, .08)

  const architecture = group('WebArchitecture', [7.22, 0, -3.08], [0, -Math.PI / 2, 0])
  addBox(architecture, [3.72, 3.42, .09], [0, 2.48, 0], materials.concreteDark, [0, 0, 0], .045)
  addBox(architecture, [3.38, 2.68, .055], [0, 2.35, .075], materials.white2, [0, 0, 0], .035)
  addBox(architecture, [2.45, .43, .035], [-.28, 3.86, .12], webLabMaterial(tools), [0, 0, 0], .025)
  addBox(architecture, [.035, 2.5, .025], [-1.56, 2.34, .13], blueGlow, [0, 0, 0], .01)
  addBox(architecture, [.035, 2.5, .025], [1.56, 2.34, .13], blueGlow, [0, 0, 0], .01)

  const web = group('WebDesk', [5.72, 0, -3.08], [0, -Math.PI / 2, 0])
  addBox(web, [3.38, .18, 1.2], [0, 1.02, 0], materials.oakDark, [0, 0, 0], .06)
  addBox(web, [3.15, .08, 1.04], [0, .9, 0], materials.graphite, [0, 0, 0], .03)
  addBox(web, [2.88, .02, .03], [0, .96, .62], blueGlow, [0, 0, 0], .008)
  for (const x of [-1.38, 1.38]) for (const z of [-.42, .42]) {
    addBox(web, [.11, .97, .11], [x, .48, z], materials.graphite, [0, 0, x < 0 ? -.04 : .04], .02)
  }

  const webMainScreen = screen(web, 1.98, 1.12, [-.48, 2.02, .16], 'WEB', 'client / systems', '#78a8b9')
  const webSideScreen = screen(web, 1.02, .66, [1.08, 1.76, .14], 'UI', 'selected work', '#78a8b9')
  addBox(web, [.085, .7, .075], [-.48, 1.46, .09], materials.graphite)
  addBox(web, [.72, .055, .3], [-.48, 1.18, .12], materials.graphite, [0, 0, 0], .025)
  addBox(web, [1.35, .05, .36], [.28, 1.17, .43], materials.black, [0, 0, 0], .025)
  addBox(web, [.68, .14, .43], [1.17, 1.16, .28], materials.graphite, [0, 0, 0], .035)

  // A phone-sized preview and pen tray make the station read as a product workspace.
  addBox(web, [.36, .62, .055], [-1.34, 1.4, .28], materials.black, [-.28, 0, 0], .045)
  addBox(web, [.29, .5, .02], [-1.34, 1.4, .325], blueGlow, [-.28, 0, 0], .025)
  addBox(web, [.58, .04, .18], [.72, 1.14, .5], materials.concreteDark, [0, 0, 0], .025)
  addCylinder(web, .025, .025, .5, [.72, 1.2, .51], materials.brass, [0, 0, Math.PI / 2], 16)

  if (budget.decorativeLights) point(0x76a9b8, .82, 3.2, [5.8, 2.35, -3.05])

  return { webMainScreen, webSideScreen }
}
