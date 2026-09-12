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

function webCredenzaMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('web:credenza-walnut', 1024, 512, (context, canvas) => {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#6b4935')
    gradient.addColorStop(.52, '#563624')
    gradient.addColorStop(1, '#42291c')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    let seed = 83
    for (let index = 0; index < 92; index += 1) {
      seed = (seed * 9301 + 49297) % 233280
      const y = (seed / 233280) * canvas.height
      const amplitude = 2 + (index % 5)
      context.strokeStyle = index % 3 === 0 ? 'rgba(25,13,8,.18)' : 'rgba(224,177,132,.10)'
      context.lineWidth = index % 7 === 0 ? 2 : 1
      context.beginPath()
      context.moveTo(0, y)
      for (let x = 0; x <= canvas.width; x += 32) context.lineTo(x, y + Math.sin(x * .021 + index) * amplitude)
      context.stroke()
    }
  })
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(2.4, 1.1)
  return new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: .62, metalness: .02 })
}

function webStatusMaterial(tools: SceneTools): THREE.MeshStandardMaterial {
  const texture = tools.canvasTexture('web:status', 768, 128, (context, canvas) => {
    context.fillStyle = '#101817'; context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#8fb9c3'; context.fillRect(22, 22, 10, 84)
    context.fillStyle = '#dbe6e3'; context.font = '800 30px Arial'; context.fillText('LIVE PRODUCTS', 58, 58)
    context.fillStyle = '#75909a'; context.font = '700 17px monospace'; context.fillText('04 SYSTEMS / ONLINE', 60, 88)
    context.fillStyle = '#8fb9c3'; context.beginPath(); context.arc(716, 64, 9, 0, Math.PI * 2); context.fill()
  })
  return new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0x8fb9c3, emissiveIntensity: .18, roughness: .42, metalness: .08 })
}

export function buildWebZone(materials: StudioMaterials, tools: SceneTools, budget: SceneDetailBudget): WebZoneMeshes {
  const { addBox, box, group, point, screen } = tools
  const blueGlow = new THREE.MeshStandardMaterial({
    color: 0x79a9b7,
    emissive: 0x6d9dab,
    emissiveIntensity: 0.68,
    roughness: .32,
    metalness: .12,
  })
  const credenzaWalnut = webCredenzaMaterial(tools)

  box('WebRug', [2.55, .025, 4.72], [5.62, .018, -3.05], materials.rug, [0, 0, 0], false, true, .08)

  // One wall-integrated product console replaces the former cross-room desk.
  // The screens remain separate meshes so preview and selector interactions do not change.
  const web = group('WebInstallation', [7.20, 0, -3.08], [0, -Math.PI / 2, 0])
  addBox(web, [4.86, 3.82, .18], [0, 2.61, 0], materials.concreteDark, [0, 0, 0], .065)
  addBox(web, [4.55, 3.47, .07], [0, 2.55, .13], materials.graphite, [0, 0, 0], .045)
  addBox(web, [4.25, 2.16, .055], [0, 2.64, .205], materials.graphite2, [0, 0, 0], .035)

  addBox(web, [2.66, .43, .04], [-.76, 4.16, .22], webLabMaterial(tools), [0, 0, 0], .025)
  addBox(web, [1.34, .22, .035], [1.44, 4.12, .225], webStatusMaterial(tools), [0, 0, 0], .025)
  addBox(web, [4.28, .028, .025], [0, 3.69, .25], blueGlow, [0, 0, 0], .008)

  const webMainScreen = screen(web, 2.66, 1.50, [-.80, 2.70, .27], 'WEB', 'selected product', '#78a8b9')
  const webSideScreen = screen(web, 1.48, .84, [1.48, 2.82, .285], 'INDEX', 'choose product', '#78a8b9')

  // The floating credenza grounds the installation and hides its service route.
  addBox(web, [4.18, .30, .64], [0, 1.18, .43], credenzaWalnut, [0, 0, 0], .065)
  addBox(web, [3.92, .065, .52], [0, 1.00, .42], materials.graphite, [0, 0, 0], .025)
  addBox(web, [1.12, .075, .30], [-1.32, 1.38, .49], materials.black, [0, .03, 0], .025)
  addBox(web, [.62, .055, .26], [.15, 1.37, .51], materials.concreteDark, [0, -.05, 0], .022)
  addBox(web, [.28, .055, .24], [1.42, 1.37, .51], blueGlow, [0, .08, 0], .022)

  // Slim shadow gaps make the surround read as installed joinery, not a flat panel.
  addBox(web, [.035, 3.08, .035], [-2.18, 2.55, .22], materials.black, [0, 0, 0], .01)
  addBox(web, [.035, 3.08, .035], [2.18, 2.55, .22], materials.black, [0, 0, 0], .01)

  if (budget.decorativeLights) point(0x76a9b8, .58, 3.4, [6.35, 2.65, -3.05])

  return { webMainScreen, webSideScreen }
}
