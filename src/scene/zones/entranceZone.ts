import * as THREE from 'three'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { StudioMaterials } from '../materials'
import type { SceneTools } from '../primitives'

function signMaterial(tools: SceneTools, key: string, title: string, subtitle: string, accent: string): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture(`entrance:${key}`, 768, 320, (context, canvas) => {
    context.fillStyle = '#ebe8df'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = accent; context.fillRect(34, 32, 92, 8)
    context.fillStyle = '#1b201e'; context.font = '900 56px Arial'; context.fillText(title, 34, 132)
    context.fillStyle = '#65706a'; context.font = '700 23px monospace'; context.fillText(subtitle, 36, 182)
    context.fillStyle = 'rgba(27,32,30,.16)'; context.fillRect(36, 236, 696, 2)
    context.fillStyle = '#1b201e'; context.font = '700 17px monospace'; context.fillText('EMFAU / VIRTUAL STUDIO', 36, 278)
  })
  return new THREE.MeshStandardMaterial({ map: texture, roughness: .68, metalness: .04 })
}

export function buildEntranceZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): void {
  const { addBox, addCylinder, addInstances, group, point } = tools
  const entrance = group('StudioEntrance')

  // Fine floor inlays lead into the room without turning the open foreground into furniture.
  addInstances(entrance, 'EntranceGuideLines', [.035, .016, 4.2], [
    { position: [-1.18, .032, 1.6] },
    { position: [1.18, .032, 1.6] },
  ], materials.brass, .008)
  addInstances(entrance, 'EntranceGuideSteps', [2.38, .014, .028], [
    { position: [0, .038, 2.42] },
    { position: [0, .038, .96] },
  ], materials.graphite2, .006)

  const marker = group('EntranceMarker', [0, 0, 3.62])
  addBox(marker, [1.44, .025, .52], [0, .04, 0], materials.concreteDark, [0, 0, 0], .08)
  addBox(marker, [1.12, .018, .035], [0, .058, -.08], materials.brass, [0, 0, 0], .009)
  addCylinder(marker, .035, .035, .018, [-.48, .06, .1], materials.sage, [0, 0, 0], 16)
  addCylinder(marker, .035, .035, .018, [.48, .06, .1], materials.terracotta, [0, 0, 0], 16)

  // Side-wall signs make the room legible from the entrance and support the bottom navigation.
  const leftSign = group('ArchiveWayfinding', [-7.31, 0, -.15], [0, Math.PI / 2, 0])
  addBox(leftSign, [1.86, .78, .055], [0, 3.68, 0], signMaterial(tools, 'archive', 'ARCHIVE  04', 'LOUNGE · RETIRED BUILDS  ←', '#b17757'), [0, 0, 0], .025)
  addBox(leftSign, [1.98, .9, .05], [0, 3.68, -.04], materials.concreteDark, [0, 0, 0], .035)

  // A compact entry beacon adds a human-scale welcome cue near the otherwise empty foreground.
  const beacon = group('EntranceBeacon', [-5.72, 0, 2.92], [0, .18, 0])
  addBox(beacon, [.72, 1.58, .42], [0, .79, 0], materials.concreteDark, [0, 0, 0], .055)
  addBox(beacon, [.58, .72, .035], [0, 1.02, .226], signMaterial(tools, 'welcome', 'HELLO.', 'CHOOSE A ZONE', '#b99b53'), [0, 0, 0], .025)
  addBox(beacon, [.46, .026, .032], [0, .52, .23], materials.brass, [0, 0, 0], .009)

  if (budget.decorativeLights) point(0xd8b36d, .72, 2.8, [-5.62, 1.42, 2.72])
}
