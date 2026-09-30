import * as THREE from 'three'
import { isMobileViewport } from '../config/responsive'
import type { StudioStore, StudioView } from '../state/studioState'
import { studioAccent } from '../interaction/studioHighlights'

type WorkArea = Exclude<StudioView, 'studio'>

// Anchor labels to the authored work areas, not to fixed screen coordinates.
// An edge arrow also makes the cropped Projects wall discoverable on overview.
const anchors: { view: WorkArea; position: readonly [number, number, number] }[] = [
  { view: 'games', position: [0, 3.1, -3.65] },
  { view: 'web', position: [6.9, 3.35, -3.88] },
  { view: 'projects', position: [6.9, 3.1, 2.05] },
  { view: 'archive', position: [-7.15, 2.65, -1.08] },
]

export function createStudioWayfinding(options: {
  camera: THREE.Camera
  canvas: HTMLCanvasElement
  store: StudioStore
  navigate(view: StudioView): void
  isCameraMoving(): boolean
  setHighlight(source: 'pill' | 'focus', view: WorkArea | null): void
}): { update(): void; setActive(view: WorkArea | null): void; destroy(): void } {
  const root = document.createElement('nav')
  root.className = 'studio-wayfinding'
  root.setAttribute('aria-label', 'Studio work areas')
  root.hidden = true
  const projected = new THREE.Vector3()
  const intro = document.querySelector<HTMLElement>('.intro')
  const markers = anchors.map(({ view, position }) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'studio-marker'
    button.dataset.view = view
    button.setAttribute('aria-label', `Explore ${view.charAt(0).toUpperCase()}${view.slice(1)}`)
    button.style.setProperty('--marker-accent', studioAccent[view])
    const arrow = document.createElement('span')
    arrow.className = 'studio-marker-arrow'
    arrow.setAttribute('aria-hidden', 'true')
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    icon.setAttribute('viewBox', '0 0 16 16')
    icon.setAttribute('width', '16')
    icon.setAttribute('height', '16')
    icon.setAttribute('focusable', 'false')
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', 'M8 3v10M3.5 8.5 8 13l4.5-4.5')
    path.setAttribute('fill', 'none')
    path.setAttribute('stroke', 'currentColor')
    path.setAttribute('stroke-width', '1.5')
    path.setAttribute('stroke-linecap', 'round')
    path.setAttribute('stroke-linejoin', 'round')
    icon.append(path)
    arrow.append(icon)
    const label = document.createElement('span')
    label.textContent = view
    button.append(arrow, label)
    const activate = () => {
      if (!root.hidden && !options.isCameraMoving() && options.store.get().view === 'studio' && !options.store.get().openProjectId) options.navigate(view)
    }
    button.addEventListener('click', activate)
    const enter = (event: PointerEvent) => { if (event.pointerType !== 'touch') options.setHighlight('pill', view) }
    const leave = () => options.setHighlight('pill', null)
    const focus = () => { if (button.matches(':focus-visible')) options.setHighlight('focus', view) }
    const blur = () => options.setHighlight('focus', null)
    button.addEventListener('pointerenter', enter); button.addEventListener('pointerleave', leave)
    button.addEventListener('focus', focus); button.addEventListener('blur', blur)
    root.append(button)
    return { button, position: new THREE.Vector3(...position), activate, enter, leave, focus, blur }
  })
  document.body.append(root)

  const update = () => {
    const state = options.store.get()
    root.hidden = isMobileViewport() || matchMedia('(hover: none) and (pointer: coarse)').matches || state.view !== 'studio' || !!state.openProjectId || options.isCameraMoving()
    if (root.hidden) return
    const rect = options.canvas.getBoundingClientRect()
    const introRect = intro?.getBoundingClientRect()
    const placed: { left: number; right: number; top: number; bottom: number }[] = []
    for (const marker of markers) {
      projected.copy(marker.position).project(options.camera)
      marker.button.hidden = projected.z < -1 || projected.z > 1
      if (marker.button.hidden) continue
      const halfWidth = marker.button.offsetWidth / 2
      const halfHeight = marker.button.offsetHeight / 2
      const rawX = rect.left + (projected.x + 1) * rect.width / 2
      const x = THREE.MathUtils.clamp(rawX, rect.left + halfWidth + 18, rect.right - halfWidth - 18)
      let y = THREE.MathUtils.clamp(rect.top + (1 - projected.y) * rect.height / 2 - 28, rect.top + 90, rect.bottom - 140)
      // Keep the introductory copy readable without moving the room anchor.
      if (introRect && x + halfWidth > introRect.left && x - halfWidth < introRect.right && y - 18 < introRect.bottom && y + 18 > introRect.top) y = introRect.bottom + 30
      // Edge-clamped labels must remain separate on smaller Desktop windows.
      for (const previous of placed) {
        if (x + halfWidth + 8 > previous.left && x - halfWidth - 8 < previous.right && y + halfHeight + 8 > previous.top && y - halfHeight - 8 < previous.bottom) y = previous.bottom + halfHeight + 8
      }
      placed.push({ left: x - halfWidth, right: x + halfWidth, top: y - halfHeight, bottom: y + halfHeight })
      const edge = Math.abs(rawX - x) > 1
      marker.button.dataset.direction = edge ? (rawX < x ? 'left' : 'right') : 'down'
      marker.button.dataset.edge = String(edge)
      marker.button.style.left = `${x}px`
      marker.button.style.top = `${y}px`
    }
  }
  const unsubscribe = options.store.subscribe(update)
  return {
    update,
    setActive: (view) => markers.forEach(({ button }) => button.classList.toggle('is-active', button.dataset.view === view)),
    destroy: () => {
      unsubscribe()
      markers.forEach(({ button, activate, enter, leave, focus, blur }) => {
        button.removeEventListener('click', activate)
        button.removeEventListener('pointerenter', enter); button.removeEventListener('pointerleave', leave)
        button.removeEventListener('focus', focus); button.removeEventListener('blur', blur)
      })
      root.remove()
    },
  }
}
