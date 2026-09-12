import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { resolveRenderQuality, type RenderQualityProfile } from '../performance/deviceProfile'

export const MAX_DESKTOP_BACKBUFFER_PIXELS = 3840 * 2160

export function resolvePixelRatio(width: number, height: number, deviceRatio: number, quality: RenderQualityProfile): number {
  const profileRatio = Math.min(deviceRatio, quality.pixelRatioCap)
  if (quality.name !== 'desktop') return profileRatio
  const backbufferRatio = Math.sqrt(MAX_DESKTOP_BACKBUFFER_PIXELS / Math.max(1, width * height))
  return Math.min(profileRatio, backbufferRatio)
}

export interface RenderingContext {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  composer: EffectComposer
  quality: RenderQualityProfile
  resize(): void
}

export function createRenderingContext(container: HTMLElement): RenderingContext {
  const quality = resolveRenderQuality()
  const renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, powerPreference: quality.name === 'mobile-low' ? 'low-power' : 'high-performance' })
  const setPixelRatio = () => {
    const ratio = resolvePixelRatio(innerWidth, innerHeight, devicePixelRatio, quality)
    renderer.setPixelRatio(ratio)
    renderer.domElement.dataset.pixelRatio = ratio.toFixed(3)
    return ratio
  }
  setPixelRatio()
  renderer.setSize(innerWidth, innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.94
  renderer.shadowMap.enabled = quality.shadows
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.shadowMap.autoUpdate = false
  renderer.shadowMap.needsUpdate = true
  renderer.domElement.setAttribute('aria-label', 'Interactive 3D studio')
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xd7d3c9)
  scene.fog = new THREE.Fog(0xd7d3c9, 15, 31)

  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 90)
  scene.add(camera)

  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))
  if (quality.bloom) {
    const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.24, 0.34, 0.85)
    bloom.threshold = 0.84
    bloom.strength = quality.bloomStrength
    bloom.radius = 0.26
    composer.addPass(bloom)
  }
  composer.addPass(new OutputPass())

  return {
    renderer, scene, camera, composer, quality,
    resize: () => {
      camera.aspect = innerWidth / innerHeight
      camera.updateProjectionMatrix()
      const pixelRatio = setPixelRatio()
      renderer.setSize(innerWidth, innerHeight)
      composer.setPixelRatio(pixelRatio)
      composer.setSize(innerWidth, innerHeight)
    },
  }
}
