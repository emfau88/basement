import * as THREE from 'three'
import { GLTFLoader, type GLTF } from 'three/addons/loaders/GLTFLoader.js'
import { KTX2Loader } from 'three/addons/loaders/KTX2Loader.js'
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js'
import { configurePbrTexture, ensureSecondaryUvs, type PbrTextureRole } from './pbrMaterials'

export interface AssetProgress {
  url: string
  loaded: number
  total: number | null
  ratio: number | null
}

export interface LoadedModel {
  root: THREE.Object3D
  animations: readonly THREE.AnimationClip[]
  source: 'asset' | 'fallback'
}

export interface LoadedEnvironment {
  texture: THREE.Texture
  source: 'hdr' | 'fallback'
}

export interface ModelLoadOptions {
  timeoutMs?: number
  fallback?: () => THREE.Group
}

export interface AssetManager {
  loadModel(path: string, options?: ModelLoadOptions): Promise<LoadedModel>
  loadTexture(path: string, role: PbrTextureRole, anisotropy?: number, timeoutMs?: number): Promise<THREE.Texture>
  loadEnvironment(path: string, timeoutMs?: number): Promise<LoadedEnvironment>
  release(root: THREE.Object3D): void
  dispose(): void
}

interface AssetManagerOptions {
  onProgress?: (progress: AssetProgress) => void
}

const DEFAULT_TIMEOUT_MS = 15_000

export function resolveAssetUrl(path: string): string {
  const relativePath = path.replace(/^\/+/, '')
  return new URL(`${import.meta.env.BASE_URL}${relativePath}`, document.baseURI).href
}

function disposeMaterial(material: THREE.Material): void {
  for (const value of Object.values(material)) {
    if (value instanceof THREE.Texture) value.dispose()
  }
  material.dispose()
}

function disposeTree(root: THREE.Object3D): void {
  const materials = new Set<THREE.Material>()
  const geometries = new Set<THREE.BufferGeometry>()
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return
    geometries.add(object.geometry)
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
    for (const material of objectMaterials) materials.add(material)
  })
  for (const geometry of geometries) geometry.dispose()
  for (const material of materials) disposeMaterial(material)
}

async function fetchBinary(url: string, timeoutMs: number, onProgress?: (progress: AssetProgress) => void): Promise<ArrayBuffer> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Asset request failed (${response.status}) for ${url}`)
    const totalHeader = Number(response.headers.get('content-length'))
    const total = Number.isFinite(totalHeader) && totalHeader > 0 ? totalHeader : null
    if (!response.body) {
      const buffer = await response.arrayBuffer()
      onProgress?.({ url, loaded: buffer.byteLength, total, ratio: total ? buffer.byteLength / total : null })
      return buffer
    }
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let loaded = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      loaded += value.byteLength
      onProgress?.({ url, loaded, total, ratio: total ? Math.min(1, loaded / total) : null })
    }
    const merged = new Uint8Array(loaded)
    let offset = 0
    for (const chunk of chunks) {
      merged.set(chunk, offset)
      offset += chunk.byteLength
    }
    return merged.buffer
  } catch (error) {
    if (controller.signal.aborted) throw new Error(`Asset request timed out after ${timeoutMs}ms for ${url}`, { cause: error })
    throw error
  } finally {
    window.clearTimeout(timeout)
  }
}

export function createAssetManager(renderer: THREE.WebGLRenderer, options: AssetManagerOptions = {}): AssetManager {
  const manager = new THREE.LoadingManager()
  const ktx2Loader = new KTX2Loader(manager).detectSupport(renderer)
  const gltfLoader = new GLTFLoader(manager)
    .setKTX2Loader(ktx2Loader)
    .setMeshoptDecoder(MeshoptDecoder)
  const hdrLoader = new HDRLoader(manager)
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()

  const modelCache = new Map<string, Promise<GLTF>>()
  const textureCache = new Map<string, Promise<THREE.Texture>>()
  const sourceTextures = new Set<THREE.Texture>()
  const pmremTargets = new Set<THREE.WebGLRenderTarget>()
  const sourceRoots = new Set<THREE.Object3D>()
  let disposed = false

  const parseModel = (url: string, timeoutMs: number): Promise<GLTF> => {
    const existing = modelCache.get(url)
    if (existing) return existing
    const request = fetchBinary(url, timeoutMs, options.onProgress)
      .then((buffer) => gltfLoader.parseAsync(buffer, new URL('.', url).href))
      .then((gltf) => {
        sourceRoots.add(gltf.scene)
        return gltf
      })
      .catch((error) => {
        modelCache.delete(url)
        throw error
      })
    modelCache.set(url, request)
    return request
  }

  const fallbackEnvironment = (): LoadedEnvironment => {
    const room = new RoomEnvironment()
    const target = pmrem.fromScene(room, 0.04)
    room.dispose()
    pmremTargets.add(target)
    return { texture: target.texture, source: 'fallback' }
  }

  return {
    async loadModel(path, loadOptions = {}) {
      if (disposed) throw new Error('Asset manager has been disposed')
      const url = resolveAssetUrl(path)
      try {
        const gltf = await parseModel(url, loadOptions.timeoutMs ?? DEFAULT_TIMEOUT_MS)
        const root = cloneSkeleton(gltf.scene)
        ensureSecondaryUvs(root)
        return { root, animations: gltf.animations, source: 'asset' }
      } catch (error) {
        if (!loadOptions.fallback) throw error
        return { root: loadOptions.fallback(), animations: [], source: 'fallback' }
      }
    },
    async loadTexture(path, role, anisotropy = 1, timeoutMs = DEFAULT_TIMEOUT_MS) {
      if (disposed) throw new Error('Asset manager has been disposed')
      const url = resolveAssetUrl(path)
      const key = `${url}:${role}:${anisotropy}`
      const existing = textureCache.get(key)
      if (existing) return existing
      const request = fetchBinary(url, timeoutMs, options.onProgress)
        .then((buffer) => {
          if (/\.ktx2(?:$|\?)/i.test(url)) {
            return new Promise<THREE.Texture>((resolve, reject) => ktx2Loader.parse(buffer, resolve, reject))
          }
          const mime = /\.png(?:$|\?)/i.test(url) ? 'image/png' : /\.webp(?:$|\?)/i.test(url) ? 'image/webp' : 'image/jpeg'
          return createImageBitmap(new Blob([buffer], { type: mime }), { imageOrientation: 'flipY' }).then((bitmap) => new THREE.Texture(bitmap))
        })
        .then((texture) => {
          const configured = configurePbrTexture(texture, role, anisotropy)
          sourceTextures.add(configured)
          return configured
        })
        .catch((error) => {
          textureCache.delete(key)
          throw error
        })
      textureCache.set(key, request)
      return request
    },
    async loadEnvironment(path, timeoutMs = DEFAULT_TIMEOUT_MS) {
      if (disposed) throw new Error('Asset manager has been disposed')
      try {
        const url = resolveAssetUrl(path)
        const parsed = hdrLoader.parse(await fetchBinary(url, timeoutMs, options.onProgress))
        const source = new THREE.DataTexture(
          parsed.data as Float32Array | Uint16Array,
          parsed.width,
          parsed.height,
          THREE.RGBAFormat,
          parsed.type,
        )
        source.colorSpace = parsed.colorSpace ?? THREE.LinearSRGBColorSpace
        source.minFilter = parsed.minFilter ?? THREE.LinearFilter
        source.magFilter = parsed.magFilter ?? THREE.LinearFilter
        source.generateMipmaps = parsed.generateMipmaps ?? false
        source.flipY = parsed.flipY ?? true
        source.needsUpdate = true
        const target = pmrem.fromEquirectangular(source)
        source.dispose()
        pmremTargets.add(target)
        return { texture: target.texture, source: 'hdr' }
      } catch {
        return fallbackEnvironment()
      }
    },
    release(root) {
      root.removeFromParent()
    },
    dispose() {
      if (disposed) return
      disposed = true
      for (const root of sourceRoots) disposeTree(root)
      for (const target of pmremTargets) target.dispose()
      for (const texture of sourceTextures) {
        const image = texture.image as { close?: () => void } | null
        image?.close?.()
        texture.dispose()
      }
      sourceRoots.clear()
      pmremTargets.clear()
      modelCache.clear()
      textureCache.clear()
      sourceTextures.clear()
      ktx2Loader.dispose()
      pmrem.dispose()
    },
  }
}
