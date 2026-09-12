import * as THREE from 'three'
import { projects, type ProjectKey } from '../data/projects'

export interface LiveCanvas {
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  texture: THREE.CanvasTexture
}

export interface LoadedProjectImage {
  key: ProjectKey
  name: string
  tag?: string
  image: HTMLImageElement
}

const imageCache = new Map<string, Promise<HTMLImageElement>>()

export function createLiveCanvas(): LiveCanvas {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 432
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D is unavailable')
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 4
  return { canvas, context, texture }
}

export function attachLiveTexture(mesh: THREE.Mesh, live: LiveCanvas, emissive = 0.72): void {
  const material = new THREE.MeshStandardMaterial({
    map: live.texture, emissiveMap: live.texture, emissive: 0xffffff,
    emissiveIntensity: emissive, roughness: 0.25, metalness: 0.02,
  })
  mesh.material = material
  material.needsUpdate = true
}

export function loadRemoteImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url)
  if (cached) return cached
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = async () => {
      try { await image.decode() } catch { /* onload already confirms a usable image */ }
      resolve(image)
    }
    image.onerror = () => reject(new Error(`Image load failed: ${url}`))
    image.src = url
  })
  imageCache.set(url, promise)
  return promise
}

export async function loadProjectImages(keys: readonly ProjectKey[]): Promise<LoadedProjectImage[]> {
  const loaded = await Promise.allSettled(keys.map(async (key) => {
    const project = projects[key]
    return { key, name: project.title.toUpperCase(), tag: project.screenTag, image: await loadRemoteImage(project.image) }
  }))
  return loaded.flatMap((result) => {
    if (result.status === 'fulfilled') return [result.value]
    console.warn('[screen asset]', result.reason)
    return []
  })
}

export function coverCrop(context: CanvasRenderingContext2D, image: CanvasImageSource | undefined, x: number, y: number, width: number, height: number, zoom = 1, panX = 0.5, panY = 0.5, alpha = 1): void {
  if (!(image instanceof HTMLImageElement)) return
  const imageRatio = image.width / image.height
  const regionRatio = width / height
  let sourceWidth: number
  let sourceHeight: number
  if (imageRatio > regionRatio) { sourceHeight = image.height / zoom; sourceWidth = sourceHeight * regionRatio }
  else { sourceWidth = image.width / zoom; sourceHeight = sourceWidth / regionRatio }
  const sourceX = Math.max(0, Math.min(image.width - sourceWidth, (image.width - sourceWidth) * panX))
  const sourceY = Math.max(0, Math.min(image.height - sourceHeight, (image.height - sourceHeight) * panY))
  context.save(); context.globalAlpha = alpha
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height)
  context.restore()
}

export function calibratedCoverCrop(context: CanvasRenderingContext2D, item: LoadedProjectImage | undefined, x: number, y: number, width: number, height: number, zoom = 1, panX = 0.5, panY = 0.5, alpha = 1): void {
  if (!item) return
  const calibration = projects[item.key].display
  context.save()
  context.filter = `brightness(${calibration.brightness}) saturate(${calibration.saturation}) contrast(${calibration.contrast})`
  coverCrop(context, item.image, x, y, width, height, zoom, panX, panY, alpha)
  context.restore()
}

export function roundRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number): void {
  const r = Math.min(radius, width / 2, height / 2)
  context.beginPath(); context.moveTo(x + r, y)
  context.arcTo(x + width, y, x + width, y + height, r); context.arcTo(x + width, y + height, x, y + height, r)
  context.arcTo(x, y + height, x, y, r); context.arcTo(x, y, x + width, y, r); context.closePath()
}

export function screenBase(context: CanvasRenderingContext2D, background = '#0e1211'): void {
  context.fillStyle = background; context.fillRect(0, 0, 768, 432)
}

export function topChrome(context: CanvasRenderingContext2D, label: string, accent = '#9bb37d'): void {
  context.fillStyle = 'rgba(7,10,9,.80)'; context.fillRect(0, 0, 768, 48)
  context.fillStyle = accent; context.font = '700 15px Arial'; context.fillText(`EMFAU // ${label.toUpperCase()}`, 26, 30)
  context.fillStyle = 'rgba(255,255,255,.40)'; context.font = '500 12px monospace'; context.fillText('LIVE', 704, 29)
}
