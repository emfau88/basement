import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { SceneDetailBudget } from '../assets/detailBudget'

export interface GamesHeroMaterials {
  walnut: THREE.MeshStandardMaterial
  graphite: THREE.MeshStandardMaterial
  floor: THREE.MeshStandardMaterial
  rug: THREE.MeshStandardMaterial
  upholstery: THREE.MeshStandardMaterial
  chairMesh: THREE.MeshStandardMaterial
  backdrop: THREE.MeshBasicMaterial
}

export interface GamesHeroController {
  setActive(active: boolean): void
  dispose(): void
}

function roundedBox(
  root: THREE.Object3D,
  name: string,
  size: readonly [number, number, number],
  position: readonly [number, number, number],
  material: THREE.Material,
  radius = 0.025,
  segments = 4,
  rotation: readonly [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(size[0], size[1], size[2], segments, radius), material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  root.add(mesh)
  return mesh
}

function cylinder(
  root: THREE.Object3D,
  name: string,
  radius: number,
  height: number,
  position: readonly [number, number, number],
  material: THREE.Material,
  segments: number,
  rotation: readonly [number, number, number] = [0, 0, 0],
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, segments), material)
  mesh.name = name
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.castShadow = true
  mesh.receiveShadow = true
  root.add(mesh)
  return mesh
}

function buildChair(root: THREE.Group, materials: GamesHeroMaterials, segments: number): void {
  const chair = new THREE.Group()
  chair.name = 'GamesErgonomicChair'
  root.add(chair)

  roundedBox(chair, 'ChairSeat', [1.08, 0.17, 0.92], [0, 0.78, -1.58], materials.upholstery, 0.085, 5, [-0.025, 0, 0])
  roundedBox(chair, 'ChairSeatLower', [0.88, 0.1, 0.72], [0, 0.68, -1.58], materials.graphite, 0.05, 4)

  const backRotation: readonly [number, number, number] = [0.055, 0, 0]
  const meshBack = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 1.12, 1, 1), materials.chairMesh)
  meshBack.name = 'ChairBackMesh'
  meshBack.position.set(0, 1.48, -1.11)
  meshBack.rotation.set(...backRotation)
  meshBack.receiveShadow = true
  chair.add(meshBack)
  roundedBox(chair, 'ChairBackLeftRail', [0.105, 1.2, 0.13], [-0.49, 1.49, -1.19], materials.graphite, 0.05, 5, [0.055, 0, -0.035])
  roundedBox(chair, 'ChairBackRightRail', [0.105, 1.2, 0.13], [0.49, 1.49, -1.19], materials.graphite, 0.05, 5, [0.055, 0, 0.035])
  roundedBox(chair, 'ChairBackTop', [0.92, 0.11, 0.13], [0, 2.08, -1.16], materials.graphite, 0.05, 5, backRotation)
  roundedBox(chair, 'ChairLumbar', [0.64, 0.12, 0.09], [0, 1.24, -1.08], materials.graphite, 0.045, 4, backRotation)
  roundedBox(chair, 'ChairSpine', [0.14, 0.92, 0.15], [0, 1.23, -1.32], materials.graphite, 0.05, 4, backRotation)

  for (const side of [-1, 1]) {
    roundedBox(chair, 'ChairArmSupport', [0.075, 0.48, 0.075], [side * 0.58, 1.01, -1.5], materials.graphite, 0.025, 4, [0, 0, side * -0.16])
    roundedBox(chair, 'ChairArmPad', [0.32, 0.075, 0.16], [side * 0.62, 1.25, -1.44], materials.upholstery, 0.035, 4)
  }

  cylinder(chair, 'ChairGasLift', 0.06, 0.62, [0, 0.37, -1.58], materials.graphite, segments)
  cylinder(chair, 'ChairBaseHub', 0.13, 0.14, [0, 0.16, -1.58], materials.graphite, segments)
  for (let index = 0; index < 5; index += 1) {
    const angle = index * Math.PI * 0.4
    const length = 0.62
    const x = Math.sin(angle) * length * 0.46
    const z = -1.58 + Math.cos(angle) * length * 0.46
    roundedBox(chair, 'ChairBaseArm', [0.075, 0.055, length], [x, 0.12, z], materials.graphite, 0.02, 3, [0, angle, 0.05])
    cylinder(chair, 'ChairCaster', 0.055, 0.07, [Math.sin(angle) * length, 0.075, -1.58 + Math.cos(angle) * length], materials.graphite, Math.max(12, segments / 2), [Math.PI / 2, 0, angle])
  }
}

function buildDeskDetails(root: THREE.Group, materials: GamesHeroMaterials, segments: number): void {
  roundedBox(root, 'WalnutHeroWorktop', [5.38, 0.18, 1.58], [0, 1.13, -3.45], materials.walnut, 0.055, 5)
  roundedBox(root, 'DeskCableTray', [3.5, 0.12, 0.28], [0, 0.88, -3.9], materials.graphite, 0.025, 3)
  for (const x of [-2.28, 2.28]) {
    roundedBox(root, 'DeskSteelLeg', [0.12, 0.94, 0.12], [x, 0.56, -3.45], materials.graphite, 0.025, 3)
    roundedBox(root, 'DeskSteelFoot', [0.7, 0.08, 0.12], [x, 0.08, -3.45], materials.graphite, 0.025, 3)
  }
  roundedBox(root, 'DeskPedestal', [0.62, 0.78, 0.82], [1.93, 0.46, -3.64], materials.graphite, 0.045, 4)
  for (const y of [0.25, 0.48, 0.71]) {
    roundedBox(root, 'DeskDrawerReveal', [0.49, 0.015, 0.035], [1.93, y, -3.215], materials.upholstery, 0.006, 2)
  }

  const keyboard = new THREE.Group()
  keyboard.name = 'HeroKeyboard'
  keyboard.position.set(-0.32, 1.245, -3.02)
  keyboard.rotation.x = -0.045
  root.add(keyboard)
  roundedBox(keyboard, 'KeyboardDeck', [1.48, 0.045, 0.42], [0, 0, 0], materials.graphite, 0.025, 3)
  const keyGeometry = new RoundedBoxGeometry(0.075, 0.018, 0.06, 2, 0.008)
  const keys = new THREE.InstancedMesh(keyGeometry, materials.upholstery, 60)
  keys.name = 'KeyboardKeys'
  const matrix = new THREE.Matrix4()
  let instance = 0
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 15; column += 1) {
      matrix.makeTranslation(-0.56 + column * 0.08, 0.032, -0.12 + row * 0.078)
      keys.setMatrixAt(instance, matrix)
      instance += 1
    }
  }
  keys.castShadow = true
  keyboard.add(keys)

  cylinder(root, 'DeskMug', 0.105, 0.22, [1.45, 1.34, -2.86], materials.upholstery, segments)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.018, 8, Math.max(16, segments), Math.PI * 1.55), materials.upholstery)
  handle.name = 'DeskMugHandle'
  handle.position.set(1.56, 1.36, -2.86)
  handle.rotation.z = -Math.PI * 0.25
  handle.castShadow = true
  root.add(handle)

  for (let index = 0; index < 3; index += 1) {
    roundedBox(root, 'DeskBook', [0.72 - index * 0.04, 0.055, 0.34], [-2.04, 1.25 + index * 0.058, -3.03], index === 1 ? materials.upholstery : materials.graphite, 0.012, 2, [0, -0.05 + index * 0.025, 0])
  }

  roundedBox(root, 'MonitorLightBar', [0.64, 0.055, 0.075], [0, 2.86, -3.57], materials.graphite, 0.018, 3)
  const lightBarGlow = new THREE.MeshBasicMaterial({ color: 0xffc775, toneMapped: false })
  lightBarGlow.userData.heroOwned = true
  roundedBox(root, 'MonitorLightBarGlow', [0.48, 0.012, 0.018], [0, 2.825, -3.52], lightBarGlow, 0.005, 2)
}

export function buildGamesHero(scene: THREE.Scene, budget: SceneDetailBudget, materials: GamesHeroMaterials, heroPlant: THREE.Object3D | null): GamesHeroController {
  const root = new THREE.Group()
  root.name = 'GamesPhotorealHero'
  scene.add(root)

  // The backplate sits immediately behind the Games glazing and intentionally
  // overfills the clear aperture, so perspective can never expose its edges.
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(6.72, 3.48), materials.backdrop)
  backdrop.name = 'GamesWaterfrontBackdrop'
  backdrop.position.set(0, 2.72, -6.52)
  backdrop.receiveShadow = false
  root.add(backdrop)

  const floor = roundedBox(root, 'GamesConcreteFloor', [10.2, 0.035, 5.45], [0, 0.006, -2.7], materials.floor, 0.018, 2)
  floor.castShadow = false
  roundedBox(root, 'GamesWovenRug', [5.72, 0.045, 3.35], [0, 0.025, -2.2], materials.rug, 0.065, 4)
  buildDeskDetails(root, materials, Math.max(16, budget.cylinderSegments))
  buildChair(root, materials, Math.max(16, budget.cylinderSegments))

  if (heroPlant) {
    const plantAnchor = new THREE.Group()
    plantAnchor.name = 'GamesHeroPlant'
    plantAnchor.position.set(-3.72, 0, -4.72)
    heroPlant.updateWorldMatrix(true, true)
    const initialBounds = new THREE.Box3().setFromObject(heroPlant)
    const initialHeight = initialBounds.getSize(new THREE.Vector3()).y
    const scale = initialHeight > 0 ? 1.82 / initialHeight : 1
    heroPlant.scale.setScalar(scale)
    heroPlant.updateWorldMatrix(true, true)
    const scaledBounds = new THREE.Box3().setFromObject(heroPlant)
    heroPlant.position.y -= scaledBounds.min.y
    heroPlant.rotation.y = -0.42
    heroPlant.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return
      object.castShadow = true
      object.receiveShadow = true
      object.userData.assetManagedGeometry = true
    })
    plantAnchor.add(heroPlant)
    root.add(plantAnchor)
  }

  const hiddenOriginals = new Map<THREE.Object3D, boolean>()
  for (const name of ['Chair', 'rug']) {
    const object = scene.getObjectByName(name)
    if (!object) continue
    hiddenOriginals.set(object, object.visible)
    object.visible = false
  }

  return {
    setActive(active) {
      root.visible = active
      for (const [object, originalVisibility] of hiddenOriginals) object.visible = active ? false : originalVisibility
    },
    dispose() {
      root.removeFromParent()
      for (const [object, originalVisibility] of hiddenOriginals) object.visible = originalVisibility
      const geometries = new Set<THREE.BufferGeometry>()
      const ownedMaterials = new Set<THREE.Material>()
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        if (!object.userData.assetManagedGeometry) geometries.add(object.geometry)
        const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
        for (const material of objectMaterials) if (material.userData.heroOwned) ownedMaterials.add(material)
      })
      for (const geometry of geometries) geometry.dispose()
      for (const material of ownedMaterials) material.dispose()
    },
  }
}
