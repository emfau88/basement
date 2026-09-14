import * as THREE from 'three'
import type { SceneDetailBudget } from '../assets/detailBudget'

export interface ArchiveContactAoPilotController {
  enabled: boolean
  dispose(): void
}

interface ContactPatch {
  name: string
  size: readonly [number, number]
  position: readonly [number, number, number]
  rotation: readonly [number, number, number]
  opacity: number
}

function createSoftContactTexture(anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable')

  context.fillStyle = '#000'
  context.fillRect(0, 0, canvas.width, canvas.height)
  const gradient = context.createRadialGradient(128, 128, 4, 128, 128, 126)
  gradient.addColorStop(0, '#fff')
  gradient.addColorStop(.36, '#e5e5e5')
  gradient.addColorStop(.7, '#777')
  gradient.addColorStop(1, '#000')
  context.fillStyle = gradient
  context.fillRect(0, 0, canvas.width, canvas.height)

  const texture = new THREE.CanvasTexture(canvas)
  texture.name = 'ArchiveSoftContactAo'
  texture.colorSpace = THREE.NoColorSpace
  texture.anisotropy = anisotropy
  texture.needsUpdate = true
  return texture
}

export function createArchiveContactAoPilot(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  budget: SceneDetailBudget,
): ArchiveContactAoPilotController {
  const pilotRequested = new URLSearchParams(window.location.search).get('contact-ao') === 'pilot'
  const enabled = budget.textureAnisotropy >= 4 && pilotRequested
  renderer.domElement.dataset.archiveContactAo = enabled ? 'pilot' : 'off'
  if (!enabled) {
    return {
      enabled: false,
      dispose() { delete renderer.domElement.dataset.archiveContactAo },
    }
  }

  const texture = createSoftContactTexture(budget.textureAnisotropy)
  renderer.domElement.dataset.archiveContactAoBytes = String(256 * 256 * 4)
  const root = new THREE.Group()
  root.name = 'ArchiveContactAoPilot'

  const patches: readonly ContactPatch[] = [
    { name: 'SofaFloorContact', size: [1.16, 2.58], position: [-6.42, .039, 1.34], rotation: [-Math.PI / 2, 0, 0], opacity: .25 },
    { name: 'CoffeeFloorContact', size: [1.44, .76], position: [-5.18, .039, .78], rotation: [-Math.PI / 2, 0, 0], opacity: .22 },
    { name: 'MemorialFloorContact', size: [.56, 2.38], position: [-7.07, .027, -1.08], rotation: [-Math.PI / 2, 0, 0], opacity: .23 },
    { name: 'ShelvesFloorContact', size: [.5, 3.18], position: [-7.09, .027, -3.9], rotation: [-Math.PI / 2, 0, 0], opacity: .2 },
    { name: 'MemorialWallContact', size: [2.72, 2.82], position: [-7.347, 2.02, -1.08], rotation: [0, Math.PI / 2, 0], opacity: .15 },
    { name: 'ShelvesWallContact', size: [3.56, 4.06], position: [-7.347, 2.1, -3.9], rotation: [0, Math.PI / 2, 0], opacity: .13 },
    { name: 'LoungeArtWallContact', size: [1.68, 1.04], position: [-7.347, 2.74, 1.32], rotation: [0, Math.PI / 2, 0], opacity: .12 },
  ]

  for (const patch of patches) {
    const material = new THREE.MeshBasicMaterial({
      color: 0x211d19,
      alphaMap: texture,
      transparent: true,
      opacity: patch.opacity,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      toneMapped: true,
    })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(...patch.size), material)
    mesh.name = patch.name
    mesh.position.set(...patch.position)
    mesh.rotation.set(...patch.rotation)
    mesh.renderOrder = 1
    root.add(mesh)
  }

  scene.add(root)
  return {
    enabled: true,
    dispose() {
      root.removeFromParent()
      root.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return
        object.geometry.dispose()
        if (object.material instanceof THREE.Material) object.material.dispose()
      })
      texture.dispose()
      delete renderer.domElement.dataset.archiveContactAo
      delete renderer.domElement.dataset.archiveContactAoBytes
    },
  }
}
