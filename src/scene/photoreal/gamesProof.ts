import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { AssetManager } from '../assets/assetManager'
import { createPbrMaterial, ensureSecondaryUvs } from '../assets/pbrMaterials'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { RenderQualityProfile } from '../../performance/deviceProfile'
import type { StudioMaterials } from '../materials'

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
  ownedTextures: THREE.Texture[]
}

const ASSET_ROOT = 'assets/photoreal/games/'

function repeat(texture: THREE.Texture, x: number, y: number): THREE.Texture {
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(x, y)
  return texture
}

async function loadMaterialSet(assets: AssetManager, anisotropy: number, desktop: boolean): Promise<MaterialSet> {
  const ownedTextures: THREE.Texture[] = []
  const concreteRoot = `${ASSET_ROOT}materials/concrete-wall/`
  const [concreteColor, concreteNormal, concreteArm] = await Promise.all([
    assets.loadTexture(`${concreteRoot}basecolor.jpg`, 'baseColor', anisotropy),
    assets.loadTexture(`${concreteRoot}normal-gl.jpg`, 'normal', anisotropy),
    assets.loadTexture(`${concreteRoot}arm.jpg`, 'roughness', anisotropy),
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

  let walnut = createPbrMaterial('walnut') as THREE.MeshStandardMaterial
  if (desktop) {
    const walnutRoot = `${ASSET_ROOT}materials/walnut/`
    const [walnutColor, walnutNormal, walnutArm] = await Promise.all([
      assets.loadTexture(`${walnutRoot}basecolor.jpg`, 'baseColor', anisotropy),
      assets.loadTexture(`${walnutRoot}normal-gl.jpg`, 'normal', anisotropy),
      assets.loadTexture(`${walnutRoot}arm.jpg`, 'roughness', anisotropy),
    ])
    repeat(walnutColor, 2.2, 1.1)
    repeat(walnutNormal, 2.2, 1.1)
    repeat(walnutArm, 2.2, 1.1)
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
    walnut.color.set(0x8f674e)
    walnut.normalScale.set(0.45, 0.45)
    walnut.roughness = 0.64
  }
  const graphite = createPbrMaterial('powderCoat') as THREE.MeshStandardMaterial
  return { concrete, walnut, graphite, ownedTextures }
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

function swapGamesMaterials(scene: THREE.Scene, current: StudioMaterials, next: MaterialSet): Map<THREE.Mesh, THREE.Material | THREE.Material[]> {
  const originals = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>()
  for (const name of ['GamesPortal', 'MainDesk']) {
    scene.getObjectByName(name)?.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || Array.isArray(object.material)) return
      let replacement: THREE.Material | null = null
      if (object.material === current.concreteDark) replacement = next.concrete
      else if (object.material === current.oakDark) replacement = next.walnut
      else if (object.material === current.graphite || object.material === current.graphite2) replacement = next.graphite
      if (!replacement) return
      originals.set(object, object.material)
      object.material = replacement
    })
  }
  return originals
}

export async function createGamesPhotorealProof(options: GamesProofOptions): Promise<GamesProofController> {
  const { scene, renderer, materials: current, budget, quality, assets } = options
  const desktop = quality.name === 'desktop'
  const materials = await loadMaterialSet(assets, budget.textureAnisotropy, desktop)
  const shell = buildShell(materials, budget)
  scene.add(shell)
  const originals = swapGamesMaterials(scene, current, materials)

  const previousEnvironment = scene.environment
  const previousEnvironmentIntensity = scene.environmentIntensity
  const environment = desktop
    ? await assets.loadEnvironment(`${ASSET_ROOT}environment/art-studio-1k.hdr`)
    : null

  const key = new THREE.SpotLight(0xffd39a, desktop ? 20 : 13, 10, Math.PI / 5.6, 0.72, 1.55)
  key.name = 'GamesHeroKey'
  key.position.set(-3.0, 4.9, -1.65)
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
    for (const [mesh, original] of originals) mesh.material = active ? (
      original === current.concreteDark ? materials.concrete
        : original === current.oakDark ? materials.walnut
          : materials.graphite
    ) : original
    if (active && environment) {
      scene.environment = environment.texture
      scene.environmentIntensity = 0.18
    } else {
      scene.environment = previousEnvironment
      scene.environmentIntensity = previousEnvironmentIntensity
    }
    renderer.toneMappingExposure = active ? 0.68 : previousExposure
    renderer.shadowMap.needsUpdate = true
  }

  setActive(true)
  return {
    setActive,
    dispose() {
      setActive(false)
      shell.removeFromParent()
      key.removeFromParent()
      key.target.removeFromParent()
      fill.removeFromParent()
      shell.traverse((object) => {
        if (object instanceof THREE.Mesh) object.geometry.dispose()
      })
      materials.concrete.dispose()
      materials.walnut.dispose()
      materials.graphite.dispose()
      for (const texture of materials.ownedTextures) texture.dispose()
    },
  }
}
