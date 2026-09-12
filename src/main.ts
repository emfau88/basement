import * as THREE from 'three'
import { CameraController } from './camera/cameraController'
import { createAmbientAudio } from './audio/ambientAudio'
import { createHotspots } from './interaction/hotspots'
import { createRaycaster } from './interaction/raycaster'
import { createRenderScheduler } from './performance/renderScheduler'
import { createStudioMaterials } from './scene/materials'
import { createSceneTools } from './scene/primitives'
import { createRenderingContext } from './scene/renderer'
import { buildStudioRoom } from './scene/room'
import { createLiveScreenSystem } from './screens/liveScreens'
import { createProjectWall } from './screens/projectWall'
import { createStudioStore, type StudioView } from './state/studioState'
import { requiredElement } from './ui/dom'
import { createMobileControls } from './ui/mobileControls'
import { createNavigationUI } from './ui/navigation'
import { createProjectModal } from './ui/projectModal'

const app = requiredElement<HTMLElement>('app')
const loader = requiredElement<HTMLElement>('loader')
const loadbar = requiredElement<HTMLElement>('loadbar')
const loadlabel = requiredElement<HTMLElement>('loadlabel')
const tooltip = requiredElement<HTMLElement>('tooltip')
const fade = requiredElement<HTMLElement>('fade')
const inspectBack = requiredElement<HTMLButtonElement>('inspectBack')

function showFallback(error: unknown): void {
  console.error('[studio initialization]', error)
  app.replaceChildren()
  const fallback = document.createElement('section'); fallback.className = 'webgl-fallback'
  const heading = document.createElement('h1'); heading.textContent = 'The studio needs WebGL.'
  const copy = document.createElement('p'); copy.textContent = 'Please enable hardware acceleration or open this page in a current browser.'
  fallback.append(heading, copy); app.append(fallback); loader.classList.add('done')
}

try {
  loadbar.style.width = '18%'
  const store = createStudioStore()
  const rendering = createRenderingContext(app)
  loadbar.style.width = '36%'
  const cameraController = new CameraController(rendering.camera)
  const materials = createStudioMaterials()
  const tools = createSceneTools(rendering.scene, materials)
  const meshes = buildStudioRoom(rendering.scene, materials, tools)
  const screens = createLiveScreenSystem(store)

  // Register every physical monitor exactly once. v11 accidentally registered this set twice.
  screens.registerGameSlideshow(meshes.gameMainScreen)
  screens.registerGameSelector(meshes.gameLeftScreen)
  screens.registerGamePan(meshes.gameRightScreen)
  screens.registerApps(meshes.webMainScreen)
  screens.registerAppSelector(meshes.webSideScreen)
  screens.registerArchive(meshes.archiveScreen)

  const projectWall = createProjectWall(meshes.projectCardMeshes, meshes.projectCardFrames)
  const modal = createProjectModal(store)
  const hotspots = createHotspots(rendering.scene)
  let scheduler: ReturnType<typeof createRenderScheduler>

  const setInspectLabel = (active: boolean) => { meshes.gameLeftScreen.userData.detailLabel = active ? 'Select project' : 'Zoom into selector' }
  const navigate = (view: StudioView) => {
    const state = store.get()
    if (state.view === view && !state.inspectMode) return
    projectWall.setHover(null); setInspectLabel(false)
    tooltip.classList.remove('show'); document.body.style.cursor = 'default'
    fade.style.opacity = '.13'; window.setTimeout(() => { fade.style.opacity = '0' }, 150)
    store.set({ view, inspectMode: null })
    cameraController.moveToView(view); scheduler.startTransition()
  }
  const enterInspect = () => {
    if (store.get().view !== 'games') return
    store.set({ inspectMode: 'gameSelector' }); setInspectLabel(true)
    cameraController.enterGameSelector(); scheduler.startTransition()
  }
  const exitInspect = () => {
    const state = store.get(); if (!state.inspectMode) return
    store.set({ inspectMode: null }); setInspectLabel(false)
    cameraController.exitInspect(state.view); scheduler.startTransition()
  }

  createNavigationUI(store, navigate)
  inspectBack.addEventListener('click', exitInspect)
  createAmbientAudio()

  scheduler = createRenderScheduler({
    render: () => rendering.composer.render(),
    updateCamera: (now) => cameraController.update(now),
    updateScreens: (now) => screens.update(now),
  })
  createMobileControls(store, enterInspect, scheduler.requestRender)
  createRaycaster({ canvas: rendering.renderer.domElement, camera: rendering.camera, meshes, hotspots, screens, projectWall, store, modal, tooltip, navigate, enterInspect, requestRender: scheduler.requestRender })

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (modal.isOpen()) modal.close()
    else if (store.get().inspectMode) exitInspect()
    else navigate('studio')
  })
  window.addEventListener('resize', () => {
    rendering.resize(); cameraController.resize(store.get().view, Boolean(store.get().inspectMode)); scheduler.requestRender()
  }, { passive: true })

  rendering.scene.traverse((object) => {
    if (object instanceof THREE.Mesh && Array.isArray(object.material)) object.material = object.material[0] ?? materials.white
  })
  screens.update(performance.now()); scheduler.requestRender()
  loadbar.style.width = '74%'
  window.setTimeout(() => { loadbar.style.width = '100%'; loadlabel.textContent = 'studio ready' }, 280)
  window.setTimeout(() => loader.classList.add('done'), 760)
} catch (error) {
  showFallback(error)
}
