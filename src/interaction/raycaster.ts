import * as THREE from 'three'
import type { ProjectKey } from '../data/projects'
import type { StudioMeshes } from '../scene/room'
import type { LiveScreenSystem } from '../screens/liveScreens'
import type { ProjectWall } from '../screens/projectWall'
import type { StudioStore, StudioView } from '../state/studioState'
import type { ProjectModal } from '../ui/projectModal'
import type { Hotspot } from './hotspots'
import { isMobileViewport } from '../config/responsive'
import type { WorkArea } from './studioHighlights'

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
  isCameraMoving(): boolean
  panStudio(horizontalFraction: number): void
  requestRender(): void
  studioTargets: THREE.Mesh[]
  setStudioHover(view: WorkArea | null): void
  clearStudioHover(): void
}

export function createRaycaster(options: Options): { cancelGesture(): void; destroy(): void } {
  const { canvas, camera, meshes, hotspots, screens, projectWall, store, modal, tooltip } = options
  const raycaster = new THREE.Raycaster(); const pointer = new THREE.Vector2()
  let gesture: { id: number; startX: number; startY: number; lastX: number; dragged: boolean } | null = null
  const canPan = () => store.get().view === 'studio' && !store.get().openProjectId && !options.isCameraMoving()
  const detailMeshes = [meshes.gameMainScreen, meshes.gameLeftScreen, meshes.gameRightScreen, meshes.webMainScreen, meshes.webSideScreen, meshes.archiveScreen, ...meshes.projectCardMeshes]
  meshes.gameMainScreen.userData = { ...meshes.gameMainScreen.userData, section: 'games', detailLabel: 'Open project', getProjectKey: () => store.get().selectedGameId }
  meshes.gameLeftScreen.userData = { ...meshes.gameLeftScreen.userData, section: 'games', detailLabel: 'Zoom into selector' }
  meshes.gameRightScreen.userData = { ...meshes.gameRightScreen.userData, section: 'games', detailLabel: 'Open project', getProjectKey: () => store.get().selectedGameId }
  meshes.webMainScreen.userData = { ...meshes.webMainScreen.userData, section: 'web', detailLabel: 'Open project', getProjectKey: () => store.get().selectedWebId }
  meshes.webSideScreen.userData = { ...meshes.webSideScreen.userData, section: 'web', detailLabel: 'Select app' }
  meshes.archiveScreen.userData = { ...meshes.archiveScreen.userData, section: 'archive', detailLabel: 'Zoom into cemetery', getProjectKey: () => screens.getArchiveProject() }

  const clearPointerFeedback = () => {
    options.setStudioHover(null)
    const changed = projectWall.setHover(null)
    document.body.style.cursor = 'default'
    tooltip.classList.remove('show')
    if (changed) options.requestRender()
  }
  // Physical frames/screens complement the legacy generous hotspot volumes.
  // Hover and activation share this resolver so the highlighted area really opens.
  const studioAreaHit = (): WorkArea | null => {
    const hit = raycaster.intersectObjects([...detailMeshes, ...options.studioTargets, ...hotspots], false)[0]
    if (!hit) return null
    const data = hit.object.userData
    const view = data.studioHighlight?.view ?? data.section ?? data.view
    return ['games', 'web', 'projects', 'archive'].includes(view) ? view as WorkArea : null
  }

  const updatePointer = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
  }
  const detailHit = () => {
    const state = store.get(); if (state.view === 'studio') return undefined
    const candidates = state.inspectMode === 'gameSelector'
      ? [meshes.gameLeftScreen]
      : state.inspectMode === 'gamePreview'
        ? [meshes.gameMainScreen, meshes.gameLeftScreen]
        : state.inspectMode === 'archiveCemetery'
          ? [meshes.archiveScreen]
          : detailMeshes
    return raycaster.intersectObjects(candidates, false).find((hit) => hit.object.userData.section === state.view)
  }

  const cancelGesture = () => {
    const previous = gesture
    gesture = null
    canvas.classList.remove('studio-dragging')
    if (previous && canvas.hasPointerCapture(previous.id)) canvas.releasePointerCapture(previous.id)
    if (previous) clearPointerFeedback()
  }
  const onPointerMove = (event: PointerEvent) => {
    if (gesture) {
      if (event.pointerId !== gesture.id) return
      if (!canPan()) { cancelGesture(); return }
      const horizontal = event.clientX - gesture.startX
      const vertical = event.clientY - gesture.startY
      if (!gesture.dragged && Math.hypot(horizontal, vertical) >= 8) {
        gesture.dragged = true
        options.clearStudioHover()
        clearPointerFeedback()
        canvas.classList.add('studio-dragging')
        options.panStudio(horizontal / canvas.getBoundingClientRect().width)
      } else if (gesture.dragged) {
        options.panStudio((event.clientX - gesture.lastX) / canvas.getBoundingClientRect().width)
      }
      gesture.lastX = event.clientX
      return
    }
    if (event.pointerType === 'touch') return
    if (event.target !== canvas || store.get().openProjectId) { clearPointerFeedback(); return }
    if (options.isCameraMoving()) { clearPointerFeedback(); return }
    updatePointer(event); raycaster.setFromCamera(pointer, camera)
    if (store.get().view === 'studio') {
      const view = studioAreaHit()
      options.setStudioHover(view)
      document.body.style.cursor = view ? 'pointer' : 'grab'
      tooltip.classList.remove('show')
      return
    }
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
    document.body.style.cursor = hotspot ? 'pointer' : store.get().view === 'studio' ? 'grab' : 'default'
    if (hotspot) { tooltip.textContent = hotspot.userData.label; tooltip.style.left = `${event.clientX}px`; tooltip.style.top = `${event.clientY}px`; tooltip.classList.add('show') }
    else tooltip.classList.remove('show')
    if (changed) options.requestRender()
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true })

  const activate = (event: PointerEvent) => {
    if (store.get().mobileSheet === 'expanded') {
      store.set({ mobileSheet: 'collapsed' })
      return
    }
    if (options.isCameraMoving()) { clearPointerFeedback(); return }
    updatePointer(event); raycaster.setFromCamera(pointer, camera)
    if (store.get().view === 'studio') {
      const view = studioAreaHit()
      if (view) options.navigate(view)
      return
    }
    const hit = detailHit()
    if (hit) {
      const mesh = hit.object as THREE.Mesh; const state = store.get()
      if (mesh === meshes.gameLeftScreen) {
        if (state.inspectMode !== 'gameSelector') options.enterGameInspect()
        else {
          const selectedKey = screens.selectGameFromHit(hit)
          if (!selectedKey) return
          if (isMobileViewport()) {
            options.requestRender()
            window.setTimeout(() => {
              const latest = store.get()
              if (latest.view === 'games' && latest.inspectMode === 'gameSelector' && latest.selectedGameId === selectedKey) options.enterGamePreview()
            }, 180)
          } else options.enterGamePreview()
        }
        return
      }
      if (mesh === meshes.archiveScreen) {
        if (state.inspectMode === 'archiveCemetery') {
          const key = screens.selectArchiveFromHit(hit)
          if (key) { clearPointerFeedback(); modal.open(key) }
          options.requestRender(); return
        }
        options.enterArchiveInspect(); return
      }
      if (mesh === meshes.webSideScreen) { screens.selectWebFromHit(hit); options.requestRender(); return }
      const key = (typeof mesh.userData.getProjectKey === 'function' ? mesh.userData.getProjectKey() : mesh.userData.projectKey) as ProjectKey | undefined
      if (key) { clearPointerFeedback(); modal.open(key) }
      return
    }
    const hotspot = raycaster.intersectObjects(hotspots, false)[0]?.object as Hotspot | undefined
    if (hotspot) options.navigate(hotspot.userData.view)
    else store.set({ mobileSheet: 'collapsed' })
  }
  const onPointerDown = (event: PointerEvent) => {
    if (!event.isPrimary) { cancelGesture(); return }
    if (event.button !== 0 || store.get().openProjectId) return
    if (canPan()) {
      gesture = { id: event.pointerId, startX: event.clientX, startY: event.clientY, lastX: event.clientX, dragged: false }
      canvas.setPointerCapture(event.pointerId)
      return
    }
    activate(event)
  }
  const onPointerUp = (event: PointerEvent) => {
    if (!gesture || event.pointerId !== gesture.id) return
    const isTap = !gesture.dragged && Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) < 8 && canPan()
    cancelGesture()
    if (isTap) activate(event)
  }
  const onPointerCancel = (event: PointerEvent) => { if (gesture?.id === event.pointerId) cancelGesture() }
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointercancel', onPointerCancel)
  const onPointerLeave = () => { if (!gesture) clearPointerFeedback() }
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('lostpointercapture', onPointerCancel)
  window.addEventListener('blur', cancelGesture)
  const onVisibility = () => { if (document.hidden) cancelGesture() }
  document.addEventListener('visibilitychange', onVisibility)
  const unsubscribe = store.subscribe(() => { if (!canPan()) cancelGesture() })
  return {
    cancelGesture,
    destroy: () => {
      cancelGesture(); unsubscribe()
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('blur', cancelGesture)
      document.removeEventListener('visibilitychange', onVisibility)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerCancel)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('lostpointercapture', onPointerCancel)
    },
  }
}
