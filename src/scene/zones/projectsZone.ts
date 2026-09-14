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

function processLabelMaterial(
  tools: SceneTools,
  key: string,
  label: string,
  note: string,
  background: string,
  foreground: string,
): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture(`projects:process:${key}`, 512, 256, (context, canvas) => {
    context.fillStyle = background; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = 'rgba(255,255,255,.14)'; context.fillRect(24, 22, 72, 5)
    context.fillStyle = foreground; context.font = '900 72px Arial'; context.fillText(label, 24, 125)
    context.globalAlpha = .7; context.font = '700 23px monospace'; context.fillText(note, 27, 178)
    context.globalAlpha = .38; context.fillRect(27, 207, 210, 3)
  })
  return new THREE.MeshStandardMaterial({
    map: texture,
    emissiveMap: texture,
    emissive: 0xffffff,
    emissiveIntensity: .12,
    roughness: .62,
    metalness: .04,
  })
}

export function buildProjectsZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): ProjectsZoneMeshes {
  const { addBox, group, point } = tools
  const zoneZ = 1.65
  const accent = new THREE.MeshStandardMaterial({
    color: 0xc48363,
    emissive: 0xa65f45,
    emissiveIntensity: .28,
    roughness: .56,
    metalness: .1,
  })

  const bench = group('Projects', [6.82, 0, zoneZ], [0, -Math.PI / 2, 0])
  const benchTop = addBox(bench, [3.35, .16, .92], [0, .9, 0], materials.oakDark, [0, 0, 0], .055)
  benchTop.userData.surfaceMaterial = 'walnut'
  addBox(bench, [3.12, .09, .76], [0, .79, 0], materials.graphite, [0, 0, 0], .03)
  for (const x of [-1.42, 1.42]) addBox(bench, [.1, .85, .1], [x, .42, -.29], materials.graphite, [0, 0, x < 0 ? -.035 : .035], .018)
  const processBlocks = [
    { x: -.84, y: 1.2, size: [.86, .44, .52] as const, material: materials.sage, label: 'BUILD', note: '01 / TRY', key: 'build', background: '#647d69', foreground: '#f3f0e7' },
    { x: .02, y: 1.18, size: [.7, .4, .46] as const, material: materials.terracotta, label: 'BREAK', note: '02 / LEARN', key: 'break', background: '#a86145', foreground: '#f5eee5' },
    { x: .88, y: 1.15, size: [.64, .34, .42] as const, material: materials.concreteDark, label: 'SHIP', note: '03 / REPEAT', key: 'ship', background: '#272c2a', foreground: '#f1eee6' },
  ]
  processBlocks.forEach((block) => {
    addBox(bench, block.size, [block.x, block.y, -.03], block.material, [0, 0, 0], .04)
    addBox(
      bench,
      [block.size[0] * .78, block.size[1] * .58, .014],
      [block.x, block.y, block.size[2] / 2 - .022],
      processLabelMaterial(tools, block.key, block.label, block.note, block.background, block.foreground),
      [0, 0, 0],
      .012,
    )
  })
  addBox(bench, [2.9, .022, .032], [0, .86, .49], accent, [0, 0, 0], .008)

  const board = group('ProjectBoard', [7.25, 0, zoneZ], [0, -Math.PI / 2, 0])
  addBox(board, [3.72, 3.38, .09], [0, 2.58, 0], materials.concreteDark, [0, 0, 0], .05)
  addBox(board, [3.45, 3.08, .065], [0, 2.48, .08], materials.white, [0, 0, 0], .04)
  addBox(board, [2.72, .4, .045], [0, 4.04, .125], projectWallMaterial(tools), [0, 0, 0], .025)
  // The terracotta rails sit outside the card footprints as an inset gallery detail.
  addBox(board, [.024, 2.46, .022], [-1.66, 2.48, .125], accent, [0, 0, 0], .008)
  addBox(board, [.024, 2.46, .022], [1.66, 2.48, .125], accent, [0, 0, 0], .008)

  const cardPositions = [
    [-.86, 3.3], [.86, 3.3],
    [-.86, 2.2], [.86, 2.2],
  ] as const
  cardPositions.forEach(([x, y]) => {
    addBox(board, [1.48, .87, .026], [x, y, .13], materials.black, [0, 0, 0], .03)
  })
  const projectCardFrames = cardPositions.map(([x, y]) => {
    const material = new THREE.MeshBasicMaterial({ color: 0xe6ba73, transparent: true, opacity: 0, depthWrite: false, toneMapped: false })
    const frame = addBox(board, [1.5, .89, .018], [x, y, .151], material, [0, 0, 0], .03)
    frame.castShadow = false; frame.receiveShadow = false
    return frame
  })
  const projectCardMeshes = cardPositions.map(([x, y], index) => {
    const card = addBox(board, [1.42, .81, .034], [x, y, .18], materials.white2, [0, 0, 0], .022)
    card.userData.hoverFrame = projectCardFrames[index]
    card.userData.baseScale = new THREE.Vector3(1, 1, 1)
    return card
  })

  if (budget.decorativeLights) point(0xf0d7bd, .48, 3.2, [6.72, 4.08, zoneZ])
  return { projectCardFrames, projectCardMeshes }
}
