import * as THREE from 'three'

export interface StudioMaterials {
  white: THREE.MeshStandardMaterial
  white2: THREE.MeshStandardMaterial
  plaster: THREE.MeshStandardMaterial
  graphite: THREE.MeshStandardMaterial
  graphite2: THREE.MeshStandardMaterial
  oak: THREE.MeshStandardMaterial
  oakLight: THREE.MeshStandardMaterial
  floor: THREE.MeshPhysicalMaterial
  rug: THREE.MeshStandardMaterial
  sage: THREE.MeshStandardMaterial
  terracotta: THREE.MeshStandardMaterial
  blue: THREE.MeshStandardMaterial
  brass: THREE.MeshStandardMaterial
  black: THREE.MeshStandardMaterial
  glass: THREE.MeshPhysicalMaterial
  leaf: THREE.MeshStandardMaterial
  leaf2: THREE.MeshStandardMaterial
}

export function createStudioMaterials(): StudioMaterials {
  return {
    white: new THREE.MeshStandardMaterial({ color: 0xe7e3da, roughness: 0.78, metalness: 0.02 }),
    white2: new THREE.MeshStandardMaterial({ color: 0xd9d6ce, roughness: 0.82, metalness: 0.02 }),
    plaster: new THREE.MeshStandardMaterial({ color: 0xcfcac0, roughness: 0.91, metalness: 0 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x2b302e, roughness: 0.48, metalness: 0.38 }),
    graphite2: new THREE.MeshStandardMaterial({ color: 0x414744, roughness: 0.42, metalness: 0.45 }),
    oak: new THREE.MeshStandardMaterial({ color: 0x9b7454, roughness: 0.62, metalness: 0.02 }),
    oakLight: new THREE.MeshStandardMaterial({ color: 0xb98d67, roughness: 0.67, metalness: 0.02 }),
    floor: new THREE.MeshPhysicalMaterial({ color: 0xb89d7c, roughness: 0.62, metalness: 0.03, clearcoat: 0.08, clearcoatRoughness: 0.8 }),
    rug: new THREE.MeshStandardMaterial({ color: 0xb9b7ad, roughness: 0.96, metalness: 0 }),
    sage: new THREE.MeshStandardMaterial({ color: 0x849e87, roughness: 0.68, metalness: 0.01 }),
    terracotta: new THREE.MeshStandardMaterial({ color: 0xbd7656, roughness: 0.68, metalness: 0.01 }),
    blue: new THREE.MeshStandardMaterial({ color: 0x729dad, roughness: 0.58, metalness: 0.04 }),
    brass: new THREE.MeshStandardMaterial({ color: 0xa4834d, roughness: 0.35, metalness: 0.72 }),
    black: new THREE.MeshStandardMaterial({ color: 0x171a19, roughness: 0.5, metalness: 0.4 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xc8d8d9, transparent: true, opacity: 0.2, roughness: 0.05, metalness: 0, transmission: 0.32, thickness: 0.08 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x55745a, roughness: 0.82, metalness: 0 }),
    leaf2: new THREE.MeshStandardMaterial({ color: 0x6f8c72, roughness: 0.8, metalness: 0 }),
  }
}
