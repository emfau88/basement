import * as THREE from 'three'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { StudioMaterials } from '../materials'
import type { SceneTools } from '../primitives'

export interface ProjectsZoneMeshes {
  projectCardFrames: THREE.Mesh[]
  projectCardMeshes: THREE.Mesh[]
}

function projectWallMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('projects:wall-sign', 1024, 256, (context, canvas) => {
    context.fillStyle = '#1b1f1d'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#c07e5f'; context.fillRect(40, 34, 122, 8)
    context.fillStyle = '#f0ede4'; context.font = '900 80px Arial'; context.fillText('PROJECT WALL', 40, 141)
    context.fillStyle = '#aab1ac'; context.font = '700 24px monospace'; context.fillText('03  /  SELECTED WORK · TAP TO OPEN', 43, 201)
  })
  return new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: .28, roughness: .5, metalness: .1 })
}

export function buildProjectsZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): ProjectsZoneMeshes {
  const { addBox, group, point } = tools
  const accent = new THREE.MeshStandardMaterial({
    color: 0xc48363,
    emissive: 0xa65f45,
    emissiveIntensity: .72,
    roughness: .48,
    metalness: .14,
  })

  const bench = group('Projects', [6.82, 0, .72], [0, -Math.PI / 2, 0])
  addBox(bench, [3.35, .16, .92], [0, .9, 0], materials.oakDark, [0, 0, 0], .055)
  addBox(bench, [3.12, .09, .76], [0, .79, 0], materials.graphite, [0, 0, 0], .03)
  for (const x of [-1.42, 1.42]) addBox(bench, [.1, .85, .1], [x, .42, -.29], materials.graphite, [0, 0, x < 0 ? -.035 : .035], .018)
  addBox(bench, [.86, .24, .52], [-.84, 1.1, -.03], materials.sage, [0, 0, 0], .04)
  addBox(bench, [.7, .2, .46], [.02, 1.08, -.03], materials.terracotta, [0, 0, 0], .04)
  addBox(bench, [.62, .09, .4], [.88, 1.03, -.03], materials.concreteDark, [0, 0, 0], .025)
  addBox(bench, [2.9, .022, .032], [0, .86, .49], accent, [0, 0, 0], .008)

  const board = group('ProjectBoard', [7.25, 0, .72], [0, -Math.PI / 2, 0])
  addBox(board, [3.72, 3.38, .09], [0, 2.58, 0], materials.concreteDark, [0, 0, 0], .05)
  addBox(board, [3.45, 3.08, .065], [0, 2.48, .08], materials.white, [0, 0, 0], .04)
  addBox(board, [2.72, .4, .045], [0, 4.04, .125], projectWallMaterial(tools), [0, 0, 0], .025)
  addBox(board, [.032, 2.46, .026], [-1.61, 2.48, .13], accent, [0, 0, 0], .009)
  addBox(board, [.032, 2.46, .026], [1.61, 2.48, .13], accent, [0, 0, 0], .009)

  const cardPositions = [
    [-.94, 3.3], [.94, 3.3],
    [-.94, 2.2], [.94, 2.2],
  ] as const
  const projectCardFrames = cardPositions.map(([x, y]) => {
    const material = new THREE.MeshBasicMaterial({ color: 0xe6ba73, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    const frame = addBox(board, [1.52, .91, .02], [x, y, .132], material, [0, 0, 0], .032)
    frame.castShadow = false; frame.receiveShadow = false
    return frame
  })
  const projectCardMeshes = cardPositions.map(([x, y], index) => {
    const card = addBox(board, [1.42, .81, .032], [x, y, .155], materials.white2, [0, 0, 0], .025)
    card.userData.hoverFrame = projectCardFrames[index]
    card.userData.baseScale = new THREE.Vector3(1, 1, 1)
    return card
  })

  if (budget.decorativeLights) point(0xd5926f, .72, 3, [6.84, 2.8, .72])
  return { projectCardFrames, projectCardMeshes }
}
