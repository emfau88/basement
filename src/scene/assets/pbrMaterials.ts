import * as THREE from 'three'

export type PbrTextureRole = 'baseColor' | 'emissive' | 'normal' | 'roughness' | 'metalness' | 'ao' | 'lightMap'
export type PbrMaterialPreset = 'concrete' | 'floor' | 'walnut' | 'powderCoat' | 'chairMesh' | 'glass'

export interface PbrMaterialMaps {
  baseColor?: THREE.Texture
  emissive?: THREE.Texture
  normal?: THREE.Texture
  roughness?: THREE.Texture
  metalness?: THREE.Texture
  ao?: THREE.Texture
  lightMap?: THREE.Texture
}

const presets: Record<Exclude<PbrMaterialPreset, 'glass'>, THREE.MeshStandardMaterialParameters> = {
  concrete: { color: 0x8a8072, roughness: 0.84, metalness: 0 },
  floor: { color: 0x706a61, roughness: 0.72, metalness: 0 },
  walnut: { color: 0x74482e, roughness: 0.46, metalness: 0 },
  powderCoat: { color: 0x171817, roughness: 0.38, metalness: 0.58 },
  chairMesh: { color: 0x101211, roughness: 0.76, metalness: 0 },
}

export function configurePbrTexture(texture: THREE.Texture, role: PbrTextureRole, anisotropy = 1): THREE.Texture {
  texture.colorSpace = role === 'baseColor' || role === 'emissive'
    ? THREE.SRGBColorSpace
    : role === 'lightMap'
      ? THREE.LinearSRGBColorSpace
      : THREE.NoColorSpace
  texture.anisotropy = Math.max(1, anisotropy)
  if (role === 'ao' || role === 'lightMap') texture.channel = 1
  texture.needsUpdate = true
  return texture
}

export function ensureSecondaryUvs(root: THREE.Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    const geometry = object.geometry
    if (!geometry.getAttribute('uv1')) {
      const primary = geometry.getAttribute('uv')
      if (primary) geometry.setAttribute('uv1', primary.clone())
    }
  })
}

export function createPbrMaterial(preset: PbrMaterialPreset, maps: PbrMaterialMaps = {}): THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  const parameters: THREE.MeshStandardMaterialParameters = {
    ...(preset === 'glass' ? {} : presets[preset]),
  }
  if (maps.baseColor) parameters.map = maps.baseColor
  if (maps.emissive) parameters.emissiveMap = maps.emissive
  if (maps.normal) parameters.normalMap = maps.normal
  if (maps.roughness) parameters.roughnessMap = maps.roughness
  if (maps.metalness) parameters.metalnessMap = maps.metalness
  if (maps.ao) parameters.aoMap = maps.ao
  if (maps.lightMap) parameters.lightMap = maps.lightMap
  if (preset === 'glass') {
    return new THREE.MeshPhysicalMaterial({
      ...parameters,
      color: 0xc8d2cf,
      roughness: 0.12,
      metalness: 0,
      transmission: 0.72,
      thickness: 0.015,
      ior: 1.5,
      transparent: true,
      opacity: 0.82,
    })
  }
  return new THREE.MeshStandardMaterial(parameters)
}
