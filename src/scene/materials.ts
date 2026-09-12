import * as THREE from 'three'

function surfaceTexture(
  key: number,
  base: readonly [number, number, number],
  variation: number,
  repeat: readonly [number, number],
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable')
  const image = context.createImageData(canvas.width, canvas.height)
  let seed = key
  for (let index = 0; index < image.data.length; index += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0
    const grain = ((seed >>> 16) / 65535 - 0.5) * variation
    const x = (index / 4) % canvas.width
    const y = Math.floor(index / 4 / canvas.width)
    const sweep = Math.sin(x * 0.047 + y * 0.011) * variation * 0.12
    image.data[index] = Math.max(0, Math.min(255, base[0] + grain + sweep))
    image.data[index + 1] = Math.max(0, Math.min(255, base[1] + grain + sweep))
    image.data[index + 2] = Math.max(0, Math.min(255, base[2] + grain + sweep))
    image.data[index + 3] = 255
  }
  context.putImageData(image, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.name = `StudioSurface-${key}`
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(...repeat)
  return texture
}

export interface StudioMaterials {
  white: THREE.MeshStandardMaterial
  white2: THREE.MeshStandardMaterial
  plaster: THREE.MeshStandardMaterial
  concreteDark: THREE.MeshStandardMaterial
  graphite: THREE.MeshStandardMaterial
  graphite2: THREE.MeshStandardMaterial
  oak: THREE.MeshStandardMaterial
  oakLight: THREE.MeshStandardMaterial
  oakDark: THREE.MeshStandardMaterial
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
  const palePlaster = surfaceTexture(1909, [216, 212, 203], 13, [3.2, 2.4])
  const warmPlaster = surfaceTexture(1913, [196, 191, 181], 16, [3.8, 2.8])
  const darkConcrete = surfaceTexture(1917, [79, 76, 70], 20, [3.2, 2.4])
  const concreteFloor = surfaceTexture(1921, [126, 120, 111], 22, [7.5, 5.2])
  return {
    white: new THREE.MeshStandardMaterial({ color: 0xe7e3da, roughness: 0.82, metalness: 0.01 }),
    white2: new THREE.MeshStandardMaterial({ map: palePlaster, color: 0xffffff, roughness: 0.9, metalness: 0 }),
    plaster: new THREE.MeshStandardMaterial({ map: warmPlaster, color: 0xffffff, roughness: 0.94, metalness: 0 }),
    concreteDark: new THREE.MeshStandardMaterial({ map: darkConcrete, color: 0xffffff, roughness: 0.92, metalness: 0.02 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x2b302e, roughness: 0.48, metalness: 0.38 }),
    graphite2: new THREE.MeshStandardMaterial({ color: 0x414744, roughness: 0.42, metalness: 0.45 }),
    oak: new THREE.MeshStandardMaterial({ color: 0x9b7454, roughness: 0.62, metalness: 0.02 }),
    oakLight: new THREE.MeshStandardMaterial({ color: 0xb98d67, roughness: 0.67, metalness: 0.02 }),
    oakDark: new THREE.MeshStandardMaterial({ color: 0x8d6242, roughness: 0.66, metalness: 0.03 }),
    floor: new THREE.MeshPhysicalMaterial({ map: concreteFloor, color: 0xffffff, roughness: 0.9, metalness: 0.02, clearcoat: 0.03, clearcoatRoughness: 0.92 }),
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
