import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { AssetManager } from '../assets/assetManager'
import { createPbrMaterial, ensureSecondaryUvs } from '../assets/pbrMaterials'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { RenderQualityProfile } from '../../performance/deviceProfile'
import type { StudioMaterials } from '../materials'
import { buildGamesHero } from './gamesHero'
import { createArchiveLightmapPilot } from './archiveLightmapPilot'

export interface GamesProofController {
  setActive(active: boolean): void
  dispose(): void
}

interface GamesProofOptions {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  materials: StudioMaterials
  budget: SceneDetailBudget
  quality: RenderQualityProfile
  assets: AssetManager
}

interface MaterialSet {
  concrete: THREE.MeshStandardMaterial
  walnut: THREE.MeshStandardMaterial
  graphite: THREE.MeshStandardMaterial
  floor: THREE.MeshStandardMaterial
  rug: THREE.MeshStandardMaterial
  upholstery: THREE.MeshStandardMaterial
  chairMesh: THREE.MeshStandardMaterial
  mug: THREE.MeshStandardMaterial
  backdrop: THREE.MeshBasicMaterial
  sofaWeave: THREE.Texture
  ownedTextures: THREE.Texture[]
}

interface MaterialSwap {
  original: THREE.Material | THREE.Material[]
  replacement: THREE.Material
}

const ASSET_ROOT = 'assets/photoreal/games/'
const SHARED_ASSET_ROOT = 'assets/photoreal/shared/'

function repeat(texture: THREE.Texture, x: number, y: number): THREE.Texture {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(x, y)
  return texture
}

function createChairMeshMaterial(ownedTextures: THREE.Texture[]): THREE.MeshStandardMaterial {
  const canvas = document.createElement('canvas')
  canvas.width = 96
  canvas.height = 96
  const context = canvas.getContext('2d')
  if (!context) return new THREE.MeshStandardMaterial({ color: 0x242725, roughness: 0.82, side: THREE.DoubleSide })
  context.fillStyle = '#141615'
  context.fillRect(0, 0, 96, 96)
  context.strokeStyle = '#a7aaa5'
  context.lineWidth = 3
  for (let offset = -96; offset < 192; offset += 12) {
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset - 96, 96)
    context.stroke()
    context.beginPath()
    context.moveTo(offset, 0)
    context.lineTo(offset + 96, 96)
    context.stroke()
  }
  const alphaMap = new THREE.CanvasTexture(canvas)
  alphaMap.colorSpace = THREE.NoColorSpace
  alphaMap.wrapS = THREE.RepeatWrapping
  alphaMap.wrapT = THREE.RepeatWrapping
  alphaMap.repeat.set(4.5, 6)
  ownedTextures.push(alphaMap)
  return new THREE.MeshStandardMaterial({
    color: 0x343835,
    roughness: 0.78,
    metalness: 0,
    alphaMap,
    alphaTest: 0.28,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
  })
}

function createMugMaterial(ownedTextures: THREE.Texture[]): THREE.MeshStandardMaterial {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) return new THREE.MeshStandardMaterial({ color: 0x171918, roughness: 0.48 })
  context.fillStyle = '#171918'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#f2eee3'
  context.font = '900 92px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('emfau', canvas.width / 2, canvas.height / 2)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  ownedTextures.push(texture)
  return new THREE.MeshStandardMaterial({ map: texture, roughness: 0.42, metalness: 0.03 })
}

function createFabricWeaveTexture(ownedTextures: THREE.Texture[], anisotropy: number): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#777777'
    context.fillRect(0, 0, canvas.width, canvas.height)
    for (let offset = 0; offset < canvas.width; offset += 4) {
      context.fillStyle = offset % 8 === 0 ? '#a2a2a2' : '#8b8b8b'
      context.fillRect(offset, 0, 1, canvas.height)
      context.fillStyle = offset % 8 === 0 ? '#555555' : '#686868'
      context.fillRect(0, offset + 1, canvas.width, 1)
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.name = 'ArchiveSofaWeaveBump'
  texture.colorSpace = THREE.NoColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(32, 20)
  texture.anisotropy = anisotropy
  ownedTextures.push(texture)
  return texture
}

async function loadMaterialSet(assets: AssetManager, anisotropy: number, desktop: boolean): Promise<MaterialSet> {
  const ownedTextures: THREE.Texture[] = []
  const concreteRoot = `${ASSET_ROOT}materials/concrete-wall/`
  const [concreteColor, concreteNormal, concreteArm, backdropTexture] = await Promise.all([
    assets.loadTexture(`${concreteRoot}basecolor.webp`, 'baseColor', anisotropy),
    assets.loadTexture(`${concreteRoot}normal-gl.webp`, 'normal', anisotropy),
    assets.loadTexture(`${concreteRoot}arm.webp`, 'roughness', anisotropy),
    assets.loadTexture(`${ASSET_ROOT}backdrops/waterfront-city.webp`, 'baseColor', anisotropy),
  ])
  repeat(concreteColor, 1.6, 1.6)
  repeat(concreteNormal, 1.6, 1.6)
  repeat(concreteArm, 1.6, 1.6)
  const concreteAo = concreteArm.clone()
  concreteAo.channel = 1
  ownedTextures.push(concreteAo)
  const concrete = createPbrMaterial('concrete', {
    baseColor: concreteColor,
    normal: concreteNormal,
    roughness: concreteArm,
    metalness: concreteArm,
    ao: concreteAo,
  }) as THREE.MeshStandardMaterial
  concrete.color.set(0x9a938a)
  concrete.normalScale.set(0.46, 0.46)
  concrete.roughness = 0.92

  // One continuous material scale across the entire 15.2 × 10.8 m studio,
  // rather than a darker Games-only island surrounded by the legacy floor.
  const floorColor = repeat(concreteColor.clone(), 7.2, 5.1)
  const floorNormal = repeat(concreteNormal.clone(), 7.2, 5.1)
  const floorArm = repeat(concreteArm.clone(), 7.2, 5.1)
  const floorAo = floorArm.clone()
  floorAo.channel = 1
  ownedTextures.push(floorColor, floorNormal, floorArm, floorAo)
  const floor = createPbrMaterial('floor', {
    baseColor: floorColor,
    normal: floorNormal,
    roughness: floorArm,
    metalness: floorArm,
    ao: floorAo,
  }) as THREE.MeshStandardMaterial
  floor.color.set(0x817c74)
  floor.normalScale.set(0.24, 0.24)
  floor.roughness = 0.84
  floor.aoMapIntensity = 0.72

  let walnut = createPbrMaterial('walnut') as THREE.MeshStandardMaterial
  if (desktop) {
    const walnutRoot = `${ASSET_ROOT}materials/walnut/`
    const [walnutColor, walnutNormal, walnutArm] = await Promise.all([
      assets.loadTexture(`${walnutRoot}basecolor.webp`, 'baseColor', anisotropy),
      assets.loadTexture(`${walnutRoot}normal-gl.webp`, 'normal', anisotropy),
      assets.loadTexture(`${walnutRoot}arm.webp`, 'roughness', anisotropy),
    ])
    repeat(walnutColor, 1.8, 0.9)
    repeat(walnutNormal, 1.8, 0.9)
    repeat(walnutArm, 1.8, 0.9)
    const walnutAo = walnutArm.clone()
    walnutAo.channel = 1
    ownedTextures.push(walnutAo)
    walnut.dispose()
    walnut = createPbrMaterial('walnut', {
      baseColor: walnutColor,
      normal: walnutNormal,
      roughness: walnutArm,
      metalness: walnutArm,
      ao: walnutAo,
    }) as THREE.MeshStandardMaterial
    walnut.color.set(0x80583f)
    walnut.normalScale.set(0.56, 0.56)
    walnut.roughness = 0.55
    walnut.aoMapIntensity = 0.68
  }
  const graphite = createPbrMaterial('powderCoat') as THREE.MeshStandardMaterial
  graphite.color.set(0x242725)
  graphite.roughness = 0.52
  graphite.metalness = 0.42
  const upholstery = createPbrMaterial('chairMesh') as THREE.MeshStandardMaterial
  upholstery.color.set(0x222522)
  upholstery.roughness = 0.82
  const chairMesh = createChairMeshMaterial(ownedTextures)
  const mug = createMugMaterial(ownedTextures)
  const sofaWeave = createFabricWeaveTexture(ownedTextures, anisotropy)

  let rug = createPbrMaterial('chairMesh') as THREE.MeshStandardMaterial
  rug.color.set(0x706153)
  rug.roughness = 0.96
  if (desktop) {
    const rugRoot = `${ASSET_ROOT}materials/rug/`
    const [rugColor, rugNormal, rugArm] = await Promise.all([
      assets.loadTexture(`${rugRoot}basecolor-warm.webp`, 'baseColor', anisotropy),
      assets.loadTexture(`${rugRoot}normal-gl.webp`, 'normal', anisotropy),
      assets.loadTexture(`${rugRoot}arm.webp`, 'roughness', anisotropy),
    ])
    repeat(rugColor, 6.4, 3.8)
    repeat(rugNormal, 6.4, 3.8)
    repeat(rugArm, 6.4, 3.8)
    const rugAo = rugArm.clone()
    rugAo.channel = 1
    ownedTextures.push(rugAo)
    rug.dispose()
    rug = createPbrMaterial('chairMesh', {
      baseColor: rugColor,
      normal: rugNormal,
      roughness: rugArm,
      ao: rugAo,
    }) as THREE.MeshStandardMaterial
    rug.color.set(0xc4b7a8)
    rug.normalScale.set(0.34, 0.34)
    rug.roughness = 0.98
  }

  const backdrop = new THREE.MeshBasicMaterial({ map: backdropTexture, color: 0xffffff, toneMapped: false, fog: false })
  return { concrete, walnut, graphite, floor, rug, upholstery, chairMesh, mug, backdrop, sofaWeave, ownedTextures }
}

function addRoundedBox(root: THREE.Group, name: string, size: readonly [number, number, number], position: readonly [number, number, number], material: THREE.Material, radius: number, segments: number): THREE.Mesh {
  const geometry = new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.castShadow = true
  mesh.receiveShadow = true
  root.add(mesh)
  return mesh
}

function buildShell(materials: MaterialSet, budget: SceneDetailBudget): THREE.Group {
  const root = new THREE.Group()
  root.name = 'GamesPhotorealShell'
  const segments = Math.max(3, Math.min(6, budget.roundedBoxSegments))

  addRoundedBox(root, 'ConcreteHeader', [7.35, 0.46, 0.58], [0, 4.66, -6.38], materials.concrete, 0.055, segments)
  addRoundedBox(root, 'ConcreteLeftPier', [0.52, 3.72, 0.58], [-3.42, 2.72, -6.38], materials.concrete, 0.045, segments)
  addRoundedBox(root, 'ConcreteRightPier', [0.52, 3.72, 0.58], [3.42, 2.72, -6.38], materials.concrete, 0.045, segments)
  // These infill panels join the Games reveal to the original building wall.
  // They turn the former freestanding portal into one continuous wall opening.
  addRoundedBox(root, 'ConcreteLeftInfill', [1.46, 3.72, 0.3], [-4.41, 2.72, -6.43], materials.concrete, 0.035, segments)
  addRoundedBox(root, 'ConcreteRightInfill', [1.46, 3.72, 0.3], [4.41, 2.72, -6.43], materials.concrete, 0.035, segments)
  addRoundedBox(root, 'ConcreteSill', [7.35, 0.23, 0.66], [0, 0.94, -6.33], materials.concrete, 0.035, segments)

  for (const x of [-3.06, 0, 3.06]) {
    addRoundedBox(root, 'DeepWindowMullion', [0.075, 3.48, 0.24], [x, 2.72, -5.94], materials.graphite, 0.012, 2)
  }
  addRoundedBox(root, 'WindowHeadCasing', [6.2, 0.075, 0.24], [0, 4.43, -5.94], materials.graphite, 0.012, 2)
  addRoundedBox(root, 'WindowSillCasing', [6.2, 0.075, 0.24], [0, 1.02, -5.94], materials.graphite, 0.012, 2)

  const canopy = addRoundedBox(root, 'GamesCeilingCanopy', [7.1, 0.16, 2.0], [0, 5.0, -4.94], materials.graphite, 0.045, segments)
  canopy.castShadow = false
  for (const x of [-2.55, 0, 2.55]) {
    const trim = addRoundedBox(root, 'WarmCeilingReveal', [0.72, 0.025, 0.3], [x, 4.9, -4.55], materials.walnut, 0.01, 2)
    trim.castShadow = false
  }
  ensureSecondaryUvs(root)
  return root
}

function collectLegacyWindowLayers(scene: THREE.Scene): Map<THREE.Object3D, boolean> {
  const originals = new Map<THREE.Object3D, boolean>()
  scene.traverse((object) => {
    if (['sky', 'City', 'mullion', 'windowTop', 'windowBottom', 'GamesPortalRibs', 'Plant'].includes(object.name)) {
      originals.set(object, object.visible)
    }
  })

  // Keep the GAME LAB sign, but suppress the three old structural portal slabs
  // now replaced by the continuous PBR wall reveal.
  const legacyPortal = scene.getObjectByName('GamesPortal')
  for (const child of legacyPortal?.children.slice(0, 3) ?? []) originals.set(child, child.visible)
  return originals
}

function swapStudioMaterials(scene: THREE.Scene, current: StudioMaterials, next: MaterialSet, desktop: boolean): Map<THREE.Mesh, MaterialSwap> {
  const originals = new Map<THREE.Mesh, MaterialSwap>()
  const gamesRoots = new Set(['GamesPortal', 'MainDesk'])
  scene.traverse((object) => {
    if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return
    let replacement: THREE.Material | null = null
    let gamesParent: THREE.Object3D | null = object.parent
    while (gamesParent && !gamesRoots.has(gamesParent.name)) gamesParent = gamesParent.parent
    if (desktop && (object.userData.surfaceMaterial === 'walnut' || object.material === current.oakDark)) replacement = next.walnut
    else if (gamesParent) {
      if (object.material === current.concreteDark) replacement = next.concrete
      else if (object.material === current.oakDark) replacement = next.walnut
      else if (object.material === current.graphite || object.material === current.graphite2) replacement = next.graphite
    }
    if (!replacement) return
    ensureSecondaryUvs(object)
    originals.set(object, { original: object.material, replacement })
    object.material = replacement
  })
  return originals
}

function refineSofaFabric(sofa: THREE.Object3D | null, weave: THREE.Texture): void {
  sofa?.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const materials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of materials) {
      if (!(material instanceof THREE.MeshStandardMaterial)) continue
      material.bumpMap = weave
      material.bumpScale = 0.007
      material.roughness = 0.88
      material.metalness = 0
      material.envMapIntensity = 0.48
      material.needsUpdate = true
    }
  })
}

export async function createGamesPhotorealProof(options: GamesProofOptions): Promise<GamesProofController> {
  const { scene, renderer, materials: current, budget, quality, assets } = options
  const desktop = quality.name === 'desktop'
  // Window width controls the compact HUD, not the fidelity of a desktop
  // workstation. Fine-pointer PCs keep the authored hero models even when the
  // browser is docked in a narrow panel; touch devices retain the lightweight
  // procedural fallbacks.
  const enhancedModels = desktop || window.matchMedia('(pointer: fine)').matches
  const legacyWindowLayers = collectLegacyWindowLayers(scene)
  const [materials, leftHeroPlant, rightHeroPlant, keyboardMouse, archiveSofa] = await Promise.all([
    loadMaterialSet(assets, budget.textureAnisotropy, desktop),
    desktop
      ? assets.loadModel(`${ASSET_ROOT}models/potted-plant-02.glb`).then((model) => model.root).catch(() => null)
      : Promise.resolve(null),
    desktop
      ? assets.loadModel(`${ASSET_ROOT}models/potted-plant-02.glb`).then((model) => model.root).catch(() => null)
      : Promise.resolve(null),
    enhancedModels
      ? assets.loadModel(`${ASSET_ROOT}models/keyboard-mouse.glb`).then((model) => model.root).catch(() => null)
      : Promise.resolve(null),
    enhancedModels
      ? assets.loadModel(`${SHARED_ASSET_ROOT}models/archive-sofa.glb`).then((model) => model.root).catch(() => null)
      : Promise.resolve(null),
  ])
  refineSofaFabric(archiveSofa, materials.sofaWeave)
  const shell = buildShell(materials, budget)
  scene.add(shell)
  const heroPlants = [leftHeroPlant, rightHeroPlant].filter((plant): plant is THREE.Object3D => plant !== null)
  const hero = buildGamesHero(scene, budget, materials, heroPlants, { keyboardMouse, archiveSofa })
  renderer.domElement.dataset.heroModels = keyboardMouse && archiveSofa ? 'desktop-ready' : 'procedural-fallback'
  const originals = swapStudioMaterials(scene, current, materials, desktop)

  const previousEnvironment = scene.environment
  const previousEnvironmentIntensity = scene.environmentIntensity
  const environment = desktop
    ? await assets.loadEnvironment(`${ASSET_ROOT}environment/art-studio-1k.hdr`)
    : null

  const key = new THREE.SpotLight(0xffd39a, desktop ? 20 : 13, 10, Math.PI / 5.6, 0.72, 1.55)
  key.name = 'GamesHeroKey'
  key.position.set(-3.0, 4.9, 0.8)
  key.target.position.set(-0.4, 1.15, -3.55)
  key.castShadow = quality.shadows
  key.shadow.mapSize.set(desktop ? 1536 : 768, desktop ? 1536 : 768)
  key.shadow.camera.near = 1
  key.shadow.camera.far = 15
  key.shadow.bias = -0.00035
  key.shadow.normalBias = 0.025
  scene.add(key, key.target)

  const fill = new THREE.RectAreaLight(0xb9d0d5, desktop ? 0.48 : 0.34, 5.8, 2.6)
  fill.name = 'GamesWindowFill'
  fill.position.set(0, 3.1, -5.72)
  fill.lookAt(0, 1.55, -2.3)
  scene.add(fill)

  const previousExposure = renderer.toneMappingExposure
  let active = true
  const setActive = (nextActive: boolean) => {
    active = nextActive
    shell.visible = active
    key.visible = active
    key.target.visible = active
    fill.visible = active
    hero.setActive(active)
    for (const [object, originalVisibility] of legacyWindowLayers) object.visible = active ? false : originalVisibility
    for (const [mesh, swap] of originals) mesh.material = active ? swap.replacement : swap.original
    if (active && environment) {
      scene.environment = environment.texture
      scene.environmentIntensity = 0.18
    } else {
      scene.environment = previousEnvironment
      scene.environmentIntensity = previousEnvironmentIntensity
    }
    renderer.toneMappingExposure = active ? 0.75 : previousExposure
    renderer.shadowMap.needsUpdate = true
  }

  setActive(true)
  // Apply the pilot after the proof activation has installed its final PBR
  // materials; otherwise the activation swap would immediately hide the maps.
  const archiveLightmap = createArchiveLightmapPilot(scene, renderer, current, budget)
  return {
    setActive,
    dispose() {
      archiveLightmap.dispose()
      setActive(false)
      delete renderer.domElement.dataset.heroModels
      shell.removeFromParent()
      hero.dispose()
      for (const model of [...heroPlants, keyboardMouse, archiveSofa]) if (model) assets.release(model)
      key.removeFromParent()
      key.target.removeFromParent()
      fill.removeFromParent()
      shell.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose()
      })
      materials.concrete.dispose()
      materials.walnut.dispose()
      materials.graphite.dispose()
      materials.floor.dispose()
      materials.rug.dispose()
      materials.upholstery.dispose()
      materials.chairMesh.dispose()
      materials.mug.dispose()
      materials.backdrop.dispose()
      for (const texture of materials.ownedTextures) texture.dispose()
    },
  }
}
