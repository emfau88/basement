import * as THREE from 'three'
import { ensureSecondaryUvs } from '../assets/pbrMaterials'
import type { SceneDetailBudget } from '../assets/detailBudget'
import type { StudioMaterials } from '../materials'

export interface ArchiveLightmapPilotController {
  enabled: boolean
  dispose(): void
}

type LightmapRole = 'wall' | 'vertical' | 'horizontal'

function createLightmap(role: LightmapRole, anisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = role === 'wall' ? 768 : 384
  canvas.height = role === 'wall' ? 512 : 384
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable')

  context.fillStyle = role === 'horizontal' ? '#22211f' : '#191b1a'
  context.fillRect(0, 0, canvas.width, canvas.height)

  if (role === 'wall') {
    const terminalBounce = context.createRadialGradient(
      canvas.width * .34, canvas.height * .47, 4,
      canvas.width * .34, canvas.height * .47, canvas.width * .34,
    )
    terminalBounce.addColorStop(0, 'rgba(230,170,105,.94)')
    terminalBounce.addColorStop(.38, 'rgba(132,103,72,.62)')
    terminalBounce.addColorStop(1, 'rgba(10,12,11,0)')
    context.fillStyle = terminalBounce
    context.fillRect(0, 0, canvas.width, canvas.height)

    const loungeBounce = context.createRadialGradient(
      canvas.width * .76, canvas.height * .55, 2,
      canvas.width * .76, canvas.height * .55, canvas.width * .27,
    )
    loungeBounce.addColorStop(0, 'rgba(240,145,75,.82)')
    loungeBounce.addColorStop(.5, 'rgba(130,87,57,.48)')
    loungeBounce.addColorStop(1, 'rgba(8,10,9,0)')
    context.fillStyle = loungeBounce
    context.fillRect(0, 0, canvas.width, canvas.height)

    const ceilingBounce = context.createLinearGradient(0, 0, 0, canvas.height)
    ceilingBounce.addColorStop(0, 'rgba(154,168,158,.42)')
    ceilingBounce.addColorStop(.42, 'rgba(70,77,70,.18)')
    ceilingBounce.addColorStop(1, 'rgba(0,0,0,0)')
    context.fillStyle = ceilingBounce
    context.fillRect(0, 0, canvas.width, canvas.height)
  } else {
    const bounce = context.createRadialGradient(
      canvas.width * (role === 'horizontal' ? .45 : .55),
      canvas.height * (role === 'horizontal' ? .38 : .42),
      2,
      canvas.width * .5,
      canvas.height * .48,
      canvas.width * .62,
    )
    bounce.addColorStop(0, role === 'horizontal' ? 'rgba(205,145,85,.9)' : 'rgba(180,140,95,.82)')
    bounce.addColorStop(.48, 'rgba(103,86,65,.52)')
    bounce.addColorStop(1, 'rgba(8,10,9,0)')
    context.fillStyle = bounce
    context.fillRect(0, 0, canvas.width, canvas.height)

    const edgeShade = context.createLinearGradient(0, 0, canvas.width, 0)
    edgeShade.addColorStop(0, 'rgba(0,0,0,.46)')
    edgeShade.addColorStop(.18, 'rgba(0,0,0,0)')
    edgeShade.addColorStop(.82, 'rgba(0,0,0,0)')
    edgeShade.addColorStop(1, 'rgba(0,0,0,.4)')
    context.fillStyle = edgeShade
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.name = `Archive${role.charAt(0).toUpperCase()}${role.slice(1)}Lightmap`
  texture.colorSpace = THREE.LinearSRGBColorSpace
  texture.channel = 1
  texture.anisotropy = anisotropy
  texture.needsUpdate = true
  return texture
}

function roleForMesh(rootName: string, mesh: THREE.Mesh): LightmapRole {
  if (rootName === 'ArchiveCoffee' || rootName === 'ArchiveLounge') return 'horizontal'
  const bounds = new THREE.Box3().setFromObject(mesh)
  const size = bounds.getSize(new THREE.Vector3())
  return size.y < Math.max(size.x, size.z) * .34 ? 'horizontal' : 'vertical'
}

function canReceivePilotLightmap(mesh: THREE.Mesh): mesh is THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
  if (Array.isArray(mesh.material) || !(mesh.material instanceof THREE.MeshStandardMaterial)) return false
  if (mesh === mesh.parent?.getObjectByName('ArchiveScreen')) return false
  if (mesh.material.emissiveMap || mesh.material.emissiveIntensity > .2) return false
  return true
}

export function createArchiveLightmapPilot(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  materials: StudioMaterials,
  budget: SceneDetailBudget,
): ArchiveLightmapPilotController {
  const pilotRequested = new URLSearchParams(window.location.search).get('archive-lightmap') === 'pilot'
  const enabled = budget.textureAnisotropy >= 4 && pilotRequested
  renderer.domElement.dataset.archiveLightmap = enabled ? 'pilot' : 'off'
  if (!enabled) {
    return {
      enabled: false,
      dispose() { delete renderer.domElement.dataset.archiveLightmap },
    }
  }

  const lightmaps: Record<LightmapRole, THREE.CanvasTexture> = {
    wall: createLightmap('wall', budget.textureAnisotropy),
    vertical: createLightmap('vertical', budget.textureAnisotropy),
    horizontal: createLightmap('horizontal', budget.textureAnisotropy),
  }
  renderer.domElement.dataset.archiveLightmapBytes = String(
    Object.values(lightmaps).reduce((total, texture) => {
      const image = texture.image as HTMLCanvasElement
      return total + image.width * image.height * 4
    }, 0),
  )
  const originalMaterials = new Map<THREE.Mesh, THREE.Material>()
  const replacements = new Set<THREE.MeshStandardMaterial>()
  const materialCache = new Map<string, THREE.MeshStandardMaterial>()

  const applyLightmap = (mesh: THREE.Mesh, role: LightmapRole, intensity: number) => {
    if (!canReceivePilotLightmap(mesh)) return
    ensureSecondaryUvs(mesh)
    const cacheKey = `${mesh.material.uuid}:${role}:${intensity}`
    let replacement = materialCache.get(cacheKey)
    if (!replacement) {
      replacement = mesh.material.clone()
      replacement.name = `${mesh.material.name || 'ArchiveMaterial'}-${role}-lightmapped`
      replacement.lightMap = lightmaps[role]
      replacement.lightMapIntensity = intensity
      replacement.needsUpdate = true
      materialCache.set(cacheKey, replacement)
      replacements.add(replacement)
    }
    originalMaterials.set(mesh, mesh.material)
    mesh.material = replacement
  }

  const wallMaterial = materials.plaster.clone()
  wallMaterial.name = 'ArchiveWallLightmapped'
  wallMaterial.color.multiplyScalar(.76)
  wallMaterial.lightMap = lightmaps.wall
  wallMaterial.lightMapIntensity = .82
  wallMaterial.roughness = .9
  wallMaterial.needsUpdate = true
  replacements.add(wallMaterial)

  const wall = new THREE.Mesh(new THREE.BoxGeometry(.018, 4.94, 9.96), wallMaterial)
  wall.name = 'ArchiveBakedWallReceiver'
  wall.position.set(-7.349, 2.57, -1.22)
  wall.receiveShadow = true
  wall.castShadow = false
  ensureSecondaryUvs(wall)
  scene.add(wall)

  const archiveRoots = ['ArchiveShelves', 'ArchiveMemorial', 'ArchiveLounge', 'ArchiveCoffee', 'ArchiveLoungeArt']
  for (const rootName of archiveRoots) {
    const root = scene.getObjectByName(rootName)
    root?.traverse((object) => {
      if (!(object instanceof THREE.Mesh) || object.name === 'ArchiveScreen') return
      applyLightmap(object, roleForMesh(rootName, object), rootName === 'ArchiveMemorial' ? .52 : .44)
    })
  }

  return {
    enabled: true,
    dispose() {
      wall.removeFromParent()
      wall.geometry.dispose()
      for (const [mesh, original] of originalMaterials) mesh.material = original
      for (const material of replacements) material.dispose()
      for (const texture of Object.values(lightmaps)) texture.dispose()
      delete renderer.domElement.dataset.archiveLightmap
      delete renderer.domElement.dataset.archiveLightmapBytes
    },
  }
}
