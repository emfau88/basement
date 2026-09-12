import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { StudioMaterials } from './materials'
import type { SceneDetailBudget } from './assets/detailBudget'

export type Triple = readonly [number, number, number]
export interface InstanceTransform {
  position: Triple
  rotation?: Triple
  scale?: Triple
}

export interface SceneTools {
  box(name: string, size: Triple, position: Triple, material?: THREE.Material, rotation?: Triple, cast?: boolean, receive?: boolean, rounded?: number): THREE.Mesh
  group(name: string, position?: Triple, rotation?: Triple): THREE.Group
  addBox(parent: THREE.Object3D, size: Triple, position: Triple, material?: THREE.Material, rotation?: Triple, rounded?: number): THREE.Mesh
  addCylinder(parent: THREE.Object3D, top: number, bottom: number, height: number, position: Triple, material?: THREE.Material, rotation?: Triple, segments?: number): THREE.Mesh
  addInstances(parent: THREE.Object3D, name: string, size: Triple, transforms: readonly InstanceTransform[], material?: THREE.Material, rounded?: number): THREE.InstancedMesh
  canvasTexture(key: string, width: number, height: number, paint: (context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => void): THREE.CanvasTexture
  point(color: THREE.ColorRepresentation, intensity: number, distance: number, position: Triple): THREE.PointLight
  tube(points: readonly Triple[], radius: number, material: THREE.Material, segments?: number): THREE.Mesh
  screen(parent: THREE.Object3D, width: number, height: number, position: Triple, title: string, subtitle: string, accent?: string, rotation?: Triple): THREE.Mesh
}

export function createSceneTools(scene: THREE.Scene, materials: StudioMaterials, budget: SceneDetailBudget): SceneTools {
  const geometryCache = new Map<string, THREE.BufferGeometry>()
  const textureCache = new Map<string, THREE.CanvasTexture>()
  const boxGeometry = (size: Triple, rounded: number) => {
    const key = `${size.join(':')}:${rounded}`
    let geometry = geometryCache.get(key)
    if (!geometry) {
      geometry = rounded > 0
        ? new RoundedBoxGeometry(size[0], size[1], size[2], budget.roundedBoxSegments, rounded)
        : new THREE.BoxGeometry(...size)
      geometryCache.set(key, geometry)
    }
    return geometry
  }

  const addBox = (parent: THREE.Object3D, size: Triple, position: Triple, material: THREE.Material = materials.white, rotation: Triple = [0, 0, 0], rounded = 0) => {
    const mesh = new THREE.Mesh(boxGeometry(size, rounded), material)
    mesh.position.set(...position)
    mesh.rotation.set(...rotation)
    mesh.castShadow = true
    mesh.receiveShadow = true
    parent.add(mesh)
    return mesh
  }

  const screenTexture = (title: string, subtitle: string, accent = '#7d9e84') => {
    const key = `screen:${title}:${subtitle}:${accent}`
    let texture = textureCache.get(key)
    if (texture) return texture
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 432
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas 2D is unavailable')
    context.fillStyle = '#111514'; context.fillRect(0, 0, 768, 432)
    const gradient = context.createLinearGradient(0, 0, 768, 432)
    gradient.addColorStop(0, 'rgba(255,255,255,.025)'); gradient.addColorStop(1, 'rgba(255,255,255,0)')
    context.fillStyle = gradient; context.fillRect(0, 0, 768, 432)
    context.strokeStyle = 'rgba(255,255,255,.045)'; context.lineWidth = 1
    for (let y = 0; y < 432; y += 16) { context.beginPath(); context.moveTo(0, y); context.lineTo(768, y); context.stroke() }
    context.fillStyle = accent; context.font = '700 20px Arial'; context.fillText('EMFAU / STUDIO', 42, 52)
    context.fillStyle = '#f2f2ec'; context.font = '800 62px Arial'; context.fillText(title, 42, 164)
    context.fillStyle = 'rgba(242,242,236,.63)'; context.font = '500 23px Arial'; context.fillText(subtitle, 42, 210)
    context.fillStyle = 'rgba(242,242,236,.16)'; context.fillRect(42, 281, 458, 2); context.fillRect(42, 320, 327, 2)
    context.fillStyle = 'rgba(242,242,236,.46)'; context.font = '500 15px monospace'; context.fillText('READY // BUILD 2026', 42, 374)
    texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = budget.textureAnisotropy
    textureCache.set(key, texture)
    return texture
  }

  return {
    addBox,
    addInstances: (parent, name, size, transforms, material = materials.white, rounded = 0) => {
      const mesh = new THREE.InstancedMesh(boxGeometry(size, rounded), material, transforms.length)
      const helper = new THREE.Object3D()
      transforms.forEach((transform, index) => {
        helper.position.set(...transform.position)
        helper.rotation.set(...(transform.rotation ?? [0, 0, 0]))
        helper.scale.set(...(transform.scale ?? [1, 1, 1]))
        helper.updateMatrix()
        mesh.setMatrixAt(index, helper.matrix)
      })
      mesh.name = name; mesh.castShadow = true; mesh.receiveShadow = true; mesh.instanceMatrix.needsUpdate = true
      parent.add(mesh); return mesh
    },
    canvasTexture: (key, width, height, paint) => {
      let texture = textureCache.get(key)
      if (texture) return texture
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas 2D is unavailable')
      paint(context, canvas)
      texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = budget.textureAnisotropy
      textureCache.set(key, texture)
      return texture
    },
    box: (name, size, position, material = materials.white, rotation = [0, 0, 0], cast = true, receive = true, rounded = 0) => {
      const mesh = new THREE.Mesh(boxGeometry(size, rounded), material)
      mesh.name = name; mesh.position.set(...position); mesh.rotation.set(...rotation)
      mesh.castShadow = cast; mesh.receiveShadow = receive; scene.add(mesh); return mesh
    },
    group: (name, position = [0, 0, 0], rotation = [0, 0, 0]) => {
      const group = new THREE.Group(); group.name = name; group.position.set(...position); group.rotation.set(...rotation); scene.add(group); return group
    },
    addCylinder: (parent, top, bottom, height, position, material = materials.graphite, rotation = [0, 0, 0], segments = 24) => {
      const resolvedSegments = Math.min(segments, budget.cylinderSegments)
      const key = `c:${top}:${bottom}:${height}:${resolvedSegments}`
      let geometry = geometryCache.get(key)
      if (!geometry) { geometry = new THREE.CylinderGeometry(top, bottom, height, resolvedSegments); geometryCache.set(key, geometry) }
      const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.rotation.set(...rotation)
      mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh
    },
    point: (color, intensity, distance, position) => {
      const light = new THREE.PointLight(color, intensity, distance, 2); light.position.set(...position); scene.add(light); return light
    },
    tube: (points, radius, material, segments = 40) => {
      const curve = new THREE.CatmullRomCurve3(points.map((point) => new THREE.Vector3(...point)))
      const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 8, false), material)
      mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh
    },
    screen: (parent, width, height, position, title, subtitle, accent = '#7d9e84', rotation = [0, 0, 0]) => {
      addBox(parent, [width + 0.14, height + 0.14, 0.095], position, materials.black, rotation, 0.045)
      const texture = screenTexture(title, subtitle, accent)
      const material = new THREE.MeshStandardMaterial({ map: texture, emissiveMap: texture, emissive: 0xffffff, emissiveIntensity: 0.88, roughness: 0.24, metalness: 0.02 })
      return addBox(parent, [width, height, 0.026], [position[0], position[1], position[2] + 0.064], material, rotation, 0.014)
    },
  }
}
