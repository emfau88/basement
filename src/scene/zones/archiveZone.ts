import * as THREE from 'three'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { StudioMaterials } from '../materials'
import type { SceneTools } from '../primitives'

export interface ArchiveZoneMeshes {
  archiveScreen: THREE.Mesh
}

function archiveWoodMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('archive:walnut', 512, 512, (context, canvas) => {
    context.fillStyle = '#684832'; context.fillRect(0, 0, canvas.width, canvas.height)
    for (let y = 0; y < canvas.height; y += 7) {
      const wave = Math.sin(y * .071) * 9 + Math.sin(y * .019) * 14
      context.strokeStyle = y % 21 === 0 ? 'rgba(34,18,11,.24)' : 'rgba(255,214,166,.075)'
      context.lineWidth = y % 21 === 0 ? 2 : 1
      context.beginPath(); context.moveTo(0, y + wave); context.bezierCurveTo(150, y - wave, 350, y + wave * .5, canvas.width, y); context.stroke()
    }
  })
  return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: .66, metalness: .03 })
}

function archiveFabricMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('archive:upholstery', 256, 256, (context, canvas) => {
    context.fillStyle = '#647565'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(237,239,226,.055)'; context.lineWidth = 1
    for (let i = 0; i < canvas.width; i += 4) {
      context.beginPath(); context.moveTo(i, 0); context.lineTo(i, canvas.height); context.stroke()
      context.beginPath(); context.moveTo(0, i); context.lineTo(canvas.width, i); context.stroke()
    }
  })
  texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.RepeatWrapping; texture.repeat.set(4, 3)
  return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: .94, metalness: 0 })
}

function plaqueMaterial(tools: SceneTools, key: string, title: string, subtitle: string, accent = '#b87755'): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture(`archive:plaque:${key}`, 768, 256, (context, canvas) => {
    context.fillStyle = '#171a18'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = accent; context.fillRect(30, 28, 82, 6)
    context.fillStyle = '#eee9dc'; context.font = '900 48px Arial'; context.fillText(title, 30, 112)
    context.fillStyle = '#9ea49c'; context.font = '700 21px monospace'; context.fillText(subtitle, 32, 158)
    context.fillStyle = 'rgba(238,233,220,.12)'; context.fillRect(32, 202, 700, 2)
  })
  return new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: .16, roughness: .54, metalness: .12 })
}

function boxLabelMaterial(tools: SceneTools, key: string, title: string, note: string, color: string): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture(`archive:box:${key}`, 512, 256, (context, canvas) => {
    context.fillStyle = color; context.fillRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = 'rgba(242,235,218,.3)'; context.lineWidth = 4; context.strokeRect(18, 18, canvas.width - 36, canvas.height - 36)
    context.fillStyle = '#eee8d9'; context.font = '900 48px Arial'; context.fillText(title, 34, 108)
    context.fillStyle = 'rgba(238,232,217,.68)'; context.font = '700 20px monospace'; context.fillText(note, 36, 158)
  })
  return new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: .08, roughness: .78, metalness: .02 })
}

export function buildArchiveZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): ArchiveZoneMeshes {
  const { addBox, addCylinder, group, point, screen } = tools
  const wood = archiveWoodMaterial(tools)
  const fabric = archiveFabricMaterial(tools)
  const warmMetal = new THREE.MeshStandardMaterial({ color: 0x9b7446, roughness: .38, metalness: .66 })
  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x202421, roughness: .43, metalness: .48 })
  const sofaFrame = new THREE.MeshStandardMaterial({ color: 0x242824, roughness: .76, metalness: .08 })
  const archiveRug = new THREE.MeshStandardMaterial({ color: 0x81776a, roughness: .96, metalness: 0 })

  // A wall-aligned archive replaces the old shelf that projected deep into the room.
  const shelves = group('ArchiveShelves', [-7.04, 0, -3.55], [0, Math.PI / 2, 0])
  addBox(shelves, [3.26, 3.55, .08], [0, 2.05, -.27], materials.concreteDark, [0, 0, 0], .035)
  for (const x of [-1.55, 0, 1.55]) addBox(shelves, [.075, 3.68, .52], [x, 2.02, 0], darkMetal, [0, 0, 0], .018)
  for (const y of [.42, 1.12, 1.82, 2.52, 3.22]) addBox(shelves, [3.18, .075, .56], [0, y, 0], wood, [0, 0, 0], .022)
  addBox(shelves, [2.88, .46, .065], [0, 3.75, .08], plaqueMaterial(tools, 'shelf', 'DEAD BUILDS.', 'LIVE LESSONS  /  ARCHIVE 04'), [0, 0, 0], .025)

  const boxes = [
    { x: -1.02, y: .69, w: .78, h: .42, d: .44, material: materials.sage, key: 'bugs', title: 'BUGS', note: '2019–2021', color: '#536758' },
    { x: .02, y: .67, w: 1.02, h: .38, d: .46, material: materials.graphite2, key: 'meta', title: 'OLD META', note: 'HANDLE WITH CARE', color: '#303633' },
    { x: .98, y: 1.39, w: .86, h: .42, d: .44, material: materials.terracotta, key: 'v1', title: 'V1.0', note: 'MOSTLY WORKED', color: '#985b41' },
    { x: -.72, y: 2.08, w: 1.28, h: .42, d: .46, material: materials.graphite2, key: 'maybe', title: 'MAYBE', note: 'SOMEDAY / MAYBE', color: '#303633' },
  ]
  boxes.forEach((box) => {
    addBox(shelves, [box.w, box.h, box.d], [box.x, box.y, .02], box.material, [0, 0, 0], .035)
    addBox(shelves, [box.w * .72, box.h * .54, .014], [box.x, box.y, box.d / 2 + .028], boxLabelMaterial(tools, box.key, box.title, box.note, box.color), [0, 0, 0], .01)
  })
  for (let index = 0; index < 6; index += 1) {
    addBox(shelves, [.12, .42 + (index % 2) * .06, .38], [-1.22 + index * .18, 2.77, .03], index % 3 === 0 ? materials.terracotta : materials.white, [0, 0, (index - 2.5) * .015], .012)
  }
  addCylinder(shelves, .18, .18, .11, [.92, 2.79, .04], warmMetal, [Math.PI / 2, 0, 0], 24)
  addCylinder(shelves, .066, .066, .125, [.92, 2.79, .105], darkMetal, [Math.PI / 2, 0, 0], 18)

  // One substantial memorial terminal is the interactive Archive hero.
  const terminal = group('ArchiveTerminal', [-6.78, 0, -1.34], [0, Math.PI / 2, 0])
  addBox(terminal, [1.94, .7, .72], [0, .5, 0], wood, [0, 0, 0], .065)
  addBox(terminal, [1.72, 1.12, .62], [0, 1.48, -.02], darkMetal, [-.025, 0, 0], .105)
  addBox(terminal, [1.52, .09, .26], [0, .94, .3], wood, [-.08, 0, 0], .025)
  const archiveScreen = screen(terminal, 1.38, .76, [0, 1.52, .32], 'PROJECT CEMETERY', 'retired builds', '#c88462')
  addBox(terminal, [1.46, .2, .026], [0, .54, .372], plaqueMaterial(tools, 'terminal', 'MEMORIAL 04', 'CLICK THE LIT GRAVE'), [0, 0, 0], .014)
  for (const x of [-.58, -.43]) addCylinder(terminal, .045, .045, .034, [x, .98, .44], x < -.5 ? materials.sage : materials.terracotta, [Math.PI / 2, 0, 0], 18)
  for (const x of [-.74, .74]) for (const z of [-.23, .23]) addCylinder(terminal, .035, .045, .3, [x, .15, z], darkMetal, [0, 0, 0], 16)

  // The lounge keeps the left side human in scale without competing with the terminal.
  tools.box('ArchiveLoungeRug', [2.75, .028, 3.65], [-5.98, .018, .62], archiveRug, [0, 0, 0], false, true, .08)
  const sofa = group('ArchiveLounge', [-6.78, 0, 1.02], [0, Math.PI / 2, 0])
  for (const x of [-1.04, 1.04]) for (const z of [-.31, .31]) addCylinder(sofa, .035, .05, .23, [x, .17, z], darkMetal, [0, 0, 0], 16)
  addBox(sofa, [2.6, .3, .92], [0, .39, 0], sofaFrame, [0, 0, 0], .12)
  addBox(sofa, [2.36, .18, .74], [0, .62, .05], fabric, [0, 0, 0], .1)
  for (const x of [-.59, .59]) addBox(sofa, [1.1, .24, .72], [x, .72, .07], fabric, [0, 0, 0], .105)
  addBox(sofa, [2.34, .78, .17], [0, 1.12, -.35], fabric, [.055, 0, 0], .1)
  for (const x of [-.59, .59]) addBox(sofa, [1.08, .67, .2], [x, 1.19, -.23], fabric, [.07, 0, 0], .105)
  for (const x of [-1.23, 1.23]) addBox(sofa, [.2, .7, .88], [x, .76, 0], sofaFrame, [0, 0, 0], .095)
  addBox(sofa, [.62, .2, .5], [-.47, .96, .12], materials.terracotta, [0, 0, .07], .085)
  addBox(sofa, [.54, .18, .46], [.5, .94, .13], materials.white, [0, 0, -.06], .08)
  addBox(sofa, [.018, .15, .66], [0, .75, .08], sofaFrame, [0, 0, 0], .006)

  const coffee = group('ArchiveCoffee', [-5.18, 0, .58], [0, -.05, 0])
  addBox(coffee, [1.42, .1, .74], [0, .43, 0], wood, [0, 0, 0], .075)
  for (const x of [-.52, .52]) for (const z of [-.25, .25]) addBox(coffee, [.052, .39, .052], [x, .2, z], darkMetal, [0, 0, 0], .014)
  addBox(coffee, [.42, .028, .26], [-.2, .5, .01], materials.white2, [0, .1, 0], .014)
  addCylinder(coffee, .085, .105, .15, [.32, .52, .02], materials.white, [0, 0, 0], 20)

  const lamp = group('ArchiveFloorLamp', [-6.62, 0, 2.58])
  addCylinder(lamp, .22, .25, .035, [0, .04, 0], darkMetal, [0, 0, 0], 24)
  addCylinder(lamp, .018, .024, 1.92, [0, 1, 0], warmMetal, [0, 0, 0], 16)
  addCylinder(lamp, .22, .38, .42, [0, 2.02, 0], materials.terracotta, [0, 0, 0], 24)
  addCylinder(lamp, .12, .12, .025, [0, 1.79, 0], materials.white, [0, 0, 0], 18)

  const loungeArt = group('ArchiveLoungeArt', [-7.31, 0, .94], [0, Math.PI / 2, 0])
  addBox(loungeArt, [1.62, .92, .055], [0, 2.82, 0], darkMetal, [0, 0, 0], .03)
  addBox(loungeArt, [1.48, .78, .025], [0, 2.82, .045], plaqueMaterial(tools, 'lounge', 'RIP, SCOPE.', 'YOU GREW TOO LARGE'), [0, 0, 0], .018)

  if (budget.decorativeLights) {
    point(0xffc987, 1.18, 3.5, [-6.2, 2.0, -1.18])
    point(0xffbd78, 1.42, 3.1, [-6.55, 2.0, 2.5])
  }

  return { archiveScreen }
}
