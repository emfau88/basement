import * as THREE from 'three'
import type { ProjectKey } from '../data/projects'
import type { StudioMeshes } from '../scene/room'
import type { LiveScreenSystem } from '../screens/liveScreens'
import type { ProjectWall } from '../screens/projectWall'
import type { StudioStore, StudioView } from '../state/studioState'
import type { ProjectModal } from '../ui/projectModal'
import type { Hotspot } from './hotspots'
import { isMobileViewport } from '../config/responsive'

interface Options {
  canvas: HTMLCanvasElement
  camera: THREE.Camera
  meshes: StudioMeshes
  hotspots: Hotspot[]
  screens: LiveScreenSystem
  projectWall: ProjectWall
  store: StudioStore
  modal: ProjectModal
  tooltip: HTMLElement
  navigate(view: StudioView): void
  enterGameInspect(): void
  enterGamePreview(): void
  enterArchiveInspect(): void
  requestRender(): void
}

export function createRaycaster(options: Options): void {
  const { canvas, camera, meshes, hotspots, screens, projectWall, store, modal, tooltip } = options
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2()
  const detailMeshes = [meshes.gameMainScreen, meshes.gameLeftScreen, meshes.gameRightScreen, meshes.webMainScreen, meshes.webSideScreen, meshes.archiveScreen, ...meshes.projectCardMeshes]
  meshes.gameMainScreen.userData = { ...meshes.gameMainScreen.userData, section: 'games', detailLabel: 'Open project', getProjectKey: () => store.get().selectedGameId }
  meshes.gameLeftScreen.userData = { ...meshes.gameLeftScreen.userData, section: 'games', detailLabel: 'Zoom into selector' }
  meshes.gameRightScreen.userData = { ...meshes.gameRightScreen.userData, section: 'games', detailLabel: 'Open project', getProjectKey: () => store.get().selectedGameId }
  meshes.webMainScreen.userData = { ...meshes.webMainScreen.userData, section: 'web', detailLabel: 'Open project', getProjectKey: () => store.get().selectedWebId }
  meshes.webSideScreen.userData = { ...meshes.webSideScreen.userData, section: 'web', detailLabel: 'Select app' }
  meshes.archiveScreen.userData = { ...meshes.archiveScreen.userData, section: 'archive', detailLabel: 'Zoom into cemetery', getProjectKey: () => screens.getArchiveProject() }

  const updatePointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
  }
  const detailHit = () => {
    const state = store.get(); if (state.view === 'studio') return undefined
    const candidates = state.inspectMode === 'gameSelector'
      ? [meshes.gameLeftScreen]
      : state.inspectMode === 'gamePreview'
        ? [meshes.gameMainScreen]
        : state.inspectMode === 'archiveCemetery'
          ? [meshes.archiveScreen]
          : detailMeshes
    return raycaster.intersectObjects(candidates, false).find((hit) => hit.object.userData.section === state.view)
  }

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'touch') return
    updatePointer(event); raycaster.setFromCamera(pointer, camera)
    const hit = detailHit()
    if (hit) {
      const mesh = hit.object as THREE.Mesh; const changed = projectWall.setHover(store.get().view === 'projects' && meshes.projectCardMeshes.includes(mesh) ? mesh : null)
      if (mesh === meshes.archiveScreen && store.get().inspectMode === 'archiveCemetery') {
        screens.selectArchiveFromHit(hit)
        options.requestRender()
      }
      document.body.style.cursor = 'pointer'; tooltip.textContent = String(mesh.userData.detailLabel ?? 'Open project'); tooltip.style.left = `${event.clientX}px`; tooltip.style.top = `${event.clientY}px`; tooltip.classList.add('show')
      if (changed) options.requestRender(); return
    }
    const changed = projectWall.setHover(null); const hotspot = raycaster.intersectObjects(hotspots, false)[0]?.object as Hotspot | undefined
    document.body.style.cursor = hotspot ? 'pointer' : 'default'
    if (hotspot) { tooltip.textContent = hotspot.userData.label; tooltip.style.left = `${event.clientX}px`; tooltip.style.top = `${event.clientY}px`; tooltip.classList.add('show') }
    else tooltip.classList.remove('show')
    if (changed) options.requestRender()
  }, { passive: true })

  canvas.addEventListener('pointerdown', (event) => {
    if (store.get().mobileSheet === 'expanded') {
      store.set({ mobileSheet: 'collapsed' })
      return
    }
    updatePointer(event); raycaster.setFromCamera(pointer, camera)
    const hit = detailHit()
    if (hit) {
      const mesh = hit.object as THREE.Mesh; const state = store.get()
      if (mesh === meshes.gameLeftScreen) {
        if (state.inspectMode !== 'gameSelector') options.enterGameInspect()
        else {
          screens.selectGameFromHit(hit)
          if (isMobileViewport()) options.requestRender()
          else options.enterGamePreview()
        }
        return
      }
      if (mesh === meshes.archiveScreen) {
        if (state.inspectMode === 'archiveCemetery') {
          const key = screens.selectArchiveFromHit(hit)
          if (key) modal.open(key)
          options.requestRender(); return
        }
        options.enterArchiveInspect(); return
      }
      if (mesh === meshes.webSideScreen) { screens.selectWebFromHit(hit); options.requestRender(); return }
      const key = (typeof mesh.userData.getProjectKey === 'function' ? mesh.userData.getProjectKey() : mesh.userData.projectKey) as ProjectKey | undefined
      if (key) { projectWall.setHover(null); modal.open(key) }
      return
    }
    const hotspot = raycaster.intersectObjects(hotspots, false)[0]?.object as Hotspot | undefined
    if (hotspot) options.navigate(hotspot.userData.view)
    else store.set({ mobileSheet: 'collapsed' })
  })
}
