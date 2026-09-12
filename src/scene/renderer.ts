import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { isMobileViewport } from '../config/responsive'

export interface RenderingContext {
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  composer: EffectComposer
  resize(): void
}

export function createRenderingContext(container: HTMLElement): RenderingContext {
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  const setPixelRatio = () => renderer.setPixelRatio(Math.min(devicePixelRatio, isMobileViewport() ? 1.05 : 1.55))
  setPixelRatio()
  renderer.setSize(innerWidth, innerHeight)
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 0.94
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
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
  const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.24, 0.34, 0.85)
  bloom.threshold = 0.84
  bloom.strength = 0.15
  bloom.radius = 0.26
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  return {
    renderer, scene, camera, composer,
    resize: () => {
      camera.aspect = innerWidth / innerHeight
      camera.updateProjectionMatrix()
      setPixelRatio()
      renderer.setSize(innerWidth, innerHeight)
      composer.setSize(innerWidth, innerHeight)
    },
  }
}
