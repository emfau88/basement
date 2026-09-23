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
import { resolveSceneDetailBudget } from './scene/assets/detailBudget'
import type { AssetManager } from './scene/assets/assetManager'
import type { GamesProofController } from './scene/photoreal/gamesProof'
import { createLiveScreenSystem } from './screens/liveScreens'
import { createProjectWall } from './screens/projectWall'
import { createStudioStore, type InspectMode, type StudioView } from './state/studioState'
import { requiredElement } from './ui/dom'
import { createMobileControls } from './ui/mobileControls'
import { createNavigationUI } from './ui/navigation'
import { createProjectModal } from './ui/projectModal'
import { createViewportController } from './ui/viewport'
import { isMobileViewport } from './config/responsive'
import { createWebGLRecoveryUI } from './ui/webglRecovery'

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
  const detailBudget = resolveSceneDetailBudget(rendering.quality)
  let assetManager: AssetManager | null = null
  let assetManagerPromise: Promise<AssetManager> | null = null
  let gamesProof: GamesProofController | null = null
  let gamesProofPromise: Promise<GamesProofController> | null = null
  const getAssetManager = (): Promise<AssetManager> => {
    if (assetManager) return Promise.resolve(assetManager)
    if (!assetManagerPromise) {
      assetManagerPromise = import('./scene/assets/assetManager').then(({ createAssetManager }) => {
        assetManager = createAssetManager(rendering.renderer, {
          onProgress: ({ ratio }) => {
            rendering.renderer.domElement.dataset.assetProgress = ratio === null ? 'indeterminate' : ratio.toFixed(3)
          },
        })
        return assetManager
      }).catch((error) => {
        assetManagerPromise = null
        throw error
      })
    }
    return assetManagerPromise
  }
  loadbar.style.width = '36%'
  const cameraController = new CameraController(rendering.camera)
  const materials = createStudioMaterials()
  const tools = createSceneTools(rendering.scene, materials, detailBudget)
  const meshes = buildStudioRoom(rendering.scene, materials, tools, detailBudget)
  const screens = createLiveScreenSystem(store, detailBudget.textureAnisotropy)

  // Register every physical monitor exactly once. v11 accidentally registered this set twice.
  screens.registerGameSlideshow(meshes.gameMainScreen)
  screens.registerGameSelector(meshes.gameLeftScreen)
  screens.registerGamePan(meshes.gameRightScreen)
  screens.registerApps(meshes.webMainScreen)
  screens.registerAppSelector(meshes.webSideScreen)
  screens.registerArchive(meshes.archiveScreen)

  const projectWall = createProjectWall(meshes.projectCardMeshes, meshes.projectCardFrames, detailBudget.textureAnisotropy)
  const syncScreenFidelity = (): boolean => {
    const state = store.get()
    const liveChanged = screens.syncResolution()
    const projectsChanged = projectWall.syncResolution(!isMobileViewport() && state.view === 'projects')
    rendering.renderer.domElement.dataset.screenResolutions = JSON.stringify({
      live: screens.getResolutionSnapshot(),
      projects: projectWall.getResolutionSnapshot(),
    })
    return liveChanged || projectsChanged
  }
  const modal = createProjectModal(store)
  const webglRecovery = createWebGLRecoveryUI()
  const hotspots = createHotspots(rendering.scene)
  let scheduler: ReturnType<typeof createRenderScheduler>
  const ensureGamesProof = (): Promise<GamesProofController> => {
    if (gamesProof) return Promise.resolve(gamesProof)
    if (!gamesProofPromise) {
      rendering.renderer.domElement.dataset.gamesProof = 'loading'
      gamesProofPromise = Promise.all([
        getAssetManager(),
        import('./scene/photoreal/gamesProof'),
      ]).then(([assets, module]) => module.createGamesPhotorealProof({
        scene: rendering.scene,
        renderer: rendering.renderer,
        materials,
        budget: detailBudget,
        quality: rendering.quality,
        assets,
      })).then((proof) => {
        gamesProof = proof
        proof.setActive(rendering.quality.name === 'desktop' || store.get().view === 'games')
        rendering.renderer.domElement.dataset.gamesProof = 'ready'
        screens.enableBackgroundPrefetch()
        scheduler.requestRender()
        return proof
      }).catch((error) => {
        console.warn('[games photoreal proof]', error)
        rendering.renderer.domElement.dataset.gamesProof = 'fallback'
        screens.enableBackgroundPrefetch()
        gamesProofPromise = null
        scheduler.requestRender()
        throw error
      })
    }
    return gamesProofPromise
  }

  // Desktop and Mobile Standard share the finished studio continuously. The
  // low-end tier still defers its lightweight Games proof until Games opens.
  const usesGamesProof = (view: StudioView): boolean => rendering.quality.name !== 'mobile-low' || view === 'games'

  const setInspectLabels = (mode: InspectMode) => {
    meshes.gameLeftScreen.userData.detailLabel = mode === 'gameSelector' ? 'Select project' : 'Zoom into selector'
    meshes.gameMainScreen.userData.detailLabel = mode === 'gamePreview' ? 'Open selected game' : 'Open project'
    meshes.archiveScreen.userData.detailLabel = mode === 'archiveCemetery' ? 'Open archived project' : 'Zoom into cemetery'
    inspectBack.textContent = mode === 'archiveCemetery'
      ? '← ARCHIVE LOUNGE'
      : mode === 'gamePreview'
        ? '← GAME SELECT'
        : '← GAMES OVERVIEW'
  }
  const navigate = (view: StudioView) => {
    const state = store.get()
    if (state.view === view && !state.inspectMode) {
      if (state.mobileSheet === 'expanded') store.set({ mobileSheet: 'collapsed' })
      return
    }
    projectWall.setHover(null); setInspectLabels(null)
    tooltip.classList.remove('show'); document.body.style.cursor = 'default'
    fade.style.opacity = '.13'; window.setTimeout(() => { fade.style.opacity = '0' }, 150)
    store.set({ view, inspectMode: null, mobileSheet: 'collapsed' })
    screens.activate(view)
    syncScreenFidelity()
    if (usesGamesProof(view)) {
      void ensureGamesProof().then((proof) => {
        if (usesGamesProof(store.get().view)) {
          proof.setActive(true)
          scheduler.requestRender()
        }
      }).catch(() => undefined)
    }
    else gamesProof?.setActive(false)
    cameraController.moveToView(view, 'collapsed'); scheduler.startTransition()
  }
  const enterInspect = (mode: Exclude<InspectMode, null>) => {
    const view = store.get().view
    if (((mode === 'gameSelector' || mode === 'gamePreview') && view !== 'games') || (mode === 'archiveCemetery' && view !== 'archive')) return
    const archiveKey = mode === 'archiveCemetery' ? screens.getArchiveProject() : undefined
    store.set({
      inspectMode: mode,
      ...(isMobileViewport() ? { mobileSheet: 'collapsed' as const } : {}),
      ...(archiveKey ? { selectedArchiveId: archiveKey } : {}),
    }); setInspectLabels(mode)
    syncScreenFidelity()
    cameraController.enterInspect(mode); scheduler.startTransition()
  }
  const enterGameInspect = () => enterInspect('gameSelector')
  const enterGamePreview = () => enterInspect('gamePreview')
  const enterArchiveInspect = () => enterInspect('archiveCemetery')
  const exitInspect = () => {
    const state = store.get(); if (!state.inspectMode) return
    store.set({ inspectMode: null }); setInspectLabels(null)
    syncScreenFidelity()
    cameraController.exitInspect(state.view, state.mobileSheet); scheduler.startTransition()
  }
  const backFromInspect = () => {
    if (store.get().inspectMode !== 'gamePreview') { exitInspect(); return }
    store.set({ inspectMode: 'gameSelector' }); setInspectLabels('gameSelector')
    syncScreenFidelity()
    cameraController.enterInspect('gameSelector'); scheduler.startTransition()
  }

  const navigation = createNavigationUI(store, navigate)
  inspectBack.addEventListener('click', backFromInspect)
  createAmbientAudio()

  scheduler = createRenderScheduler({
    render: () => rendering.composer.render(),
    updateCamera: (now) => cameraController.update(now),
    updateScreens: (now) => screens.update(now),
    screenIntervalMs: rendering.quality.screenIntervalMs,
  })
  rendering.renderer.domElement.dataset.quality = rendering.quality.name
  rendering.renderer.domElement.dataset.sceneDetail = String(detailBudget.dustParticles)
  syncScreenFidelity()
  rendering.renderer.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); webglRecovery.show() })
  rendering.renderer.domElement.addEventListener('webglcontextrestored', () => { webglRecovery.hide(); scheduler.requestRender() })
  const mobileControls = createMobileControls({
    store,
    enterGameInspect,
    enterArchiveInspect,
    openProject: modal.open,
    setFeaturedSelection: (key) => { if (projectWall.setSelected(key)) scheduler.requestRender() },
    requestRender: scheduler.requestRender,
  })
  const assetSmoke = new URLSearchParams(location.search).get('assetSmoke')
  if (assetSmoke) {
    rendering.renderer.domElement.dataset.assetSmoke = 'loading'
    void getAssetManager().then((assets) => {
      const smokePath = assetSmoke === 'missing' ? 'assets/runtime/fixtures/missing.glb' : 'assets/runtime/fixtures/smoke-box.glb'
      void assets.loadModel(smokePath, {
        timeoutMs: 4_000,
        fallback: () => new THREE.Group(),
      }).then((model) => {
        model.root.visible = false
        rendering.scene.add(model.root)
        rendering.renderer.domElement.dataset.assetSmoke = model.source
        if (assetSmoke === 'dispose') {
          assets.release(model.root)
          assets.dispose()
          assetManager = null
          assetManagerPromise = null
          rendering.renderer.domElement.dataset.assetDisposed = 'true'
        }
      }).catch(() => {
        rendering.renderer.domElement.dataset.assetSmoke = 'error'
      })
      if (assetSmoke === 'environment') {
        void assets.loadEnvironment('assets/runtime/fixtures/missing.hdr', 4_000).then((environment) => {
          rendering.renderer.domElement.dataset.assetEnvironment = environment.source
        })
      }
    }).catch(() => {
      rendering.renderer.domElement.dataset.assetSmoke = 'error'
    })
  }
  let previousSheet = store.get().mobileSheet
  const unsubscribeCameraLayout = store.subscribe((state) => {
    if (state.mobileSheet === previousSheet) return
    previousSheet = state.mobileSheet
    if (!isMobileViewport() || state.inspectMode) return
    cameraController.adaptToSheet(state.view, state.mobileSheet); scheduler.startTransition()
  })
  createRaycaster({ canvas: rendering.renderer.domElement, camera: rendering.camera, meshes, hotspots, screens, projectWall, store, modal, tooltip, navigate, enterGameInspect, enterGamePreview, enterArchiveInspect, requestRender: scheduler.requestRender })

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return
    if (modal.isOpen()) modal.close()
    else if (store.get().inspectMode) backFromInspect()
    else if (store.get().mobileSheet === 'expanded') store.set({ mobileSheet: 'collapsed' })
    else navigate('studio')
  })
  const viewport = createViewportController(() => {
    const state = store.get()
    rendering.resize(); syncScreenFidelity(); cameraController.resize(state.view, state.inspectMode, state.mobileSheet); scheduler.requestRender()
  })
  window.addEventListener('pagehide', () => {
    viewport.destroy(); mobileControls.destroy(); navigation.destroy(); unsubscribeCameraLayout(); scheduler.destroy(); gamesProof?.dispose(); assetManager?.dispose()
  }, { once: true })

  rendering.scene.traverse((object) => {
    if (object instanceof THREE.Mesh && Array.isArray(object.material)) object.material = object.material[0] ?? materials.white
  })
  screens.update(performance.now()); scheduler.requestRender()
  if (usesGamesProof(store.get().view)) {
    window.setTimeout(() => {
      void ensureGamesProof().then((proof) => {
        if (!usesGamesProof(store.get().view)) return
        proof.setActive(true)
        scheduler.requestRender()
      }).catch(() => undefined)
    }, 820)
  }
  loadbar.style.width = '74%'
  window.setTimeout(() => { loadbar.style.width = '100%'; loadlabel.textContent = 'studio ready' }, 280)
  window.setTimeout(() => loader.classList.add('done'), 760)
} catch (error) {
  showFallback(error)
}
