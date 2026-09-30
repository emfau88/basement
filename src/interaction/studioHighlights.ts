import * as THREE from 'three'
import { isMobileViewport } from '../config/responsive'
import type { StudioStore, StudioView } from '../state/studioState'

export type WorkArea = Exclude<StudioView, 'studio'>
export const studioAccent: Record<WorkArea, string> = {
  games: '#d9c57e', web: '#9fc6c8', projects: '#d9a18a', archive: '#b6c5a9',
}
type Source = 'scene' | 'pill' | 'focus'
interface HighlightTag { view: WorkArea; face: 'front' | 'top'; radius: number; surfaceOffset?: number }

// A thin surface-mounted ring, not a bounding box or full-screen outline pass.
function roundedPath(path: THREE.Path, width: number, height: number, radius: number): void {
  const x = width / 2; const y = height / 2
  const r = Math.min(radius, x, y)
  path.moveTo(-x + r, -y); path.lineTo(x - r, -y)
  path.quadraticCurveTo(x, -y, x, -y + r); path.lineTo(x, y - r)
  path.quadraticCurveTo(x, y, x - r, y); path.lineTo(-x + r, y)
  path.quadraticCurveTo(-x, y, -x, y - r); path.lineTo(-x, -y + r)
  path.quadraticCurveTo(-x, -y, -x + r, -y)
  path.closePath()
}

export function createStudioHighlights(options: {
  scene: THREE.Scene
  canvas: HTMLCanvasElement
  store: StudioStore
  isCameraMoving(): boolean
  requestRender(): void
}) {
  const targets: THREE.Mesh[] = []
  const outlines: THREE.Mesh<THREE.ShapeGeometry, THREE.MeshBasicMaterial>[] = []
  const materials = new Map<WorkArea, THREE.MeshBasicMaterial>()
  const sources: Record<Source, WorkArea | null> = { scene: null, pill: null, focus: null }
  const listeners = new Set<(view: WorkArea | null) => void>()
  let active: WorkArea | null = null
  let shown: WorkArea | null = null
  let startOpacity = 0; let targetOpacity = 0; let startedAt = 0
  const enabled = () => !isMobileViewport() && !matchMedia('(hover: none) and (pointer: coarse)').matches
    && options.store.get().view === 'studio' && !options.store.get().openProjectId
    && !options.isCameraMoving() && !options.canvas.classList.contains('studio-dragging') && !document.hidden

  const authored: THREE.Mesh[] = []
  options.scene.traverse((object) => { if (object instanceof THREE.Mesh && object.userData.studioHighlight) authored.push(object) })
  for (const mesh of authored) {
    const tag = mesh.userData.studioHighlight as HighlightTag
    mesh.geometry.computeBoundingBox()
    const bounds = mesh.geometry.boundingBox!
    const size = bounds.getSize(new THREE.Vector3())
    const center = bounds.getCenter(new THREE.Vector3())
    const height = tag.face === 'top' ? size.z : size.y
    const thickness = .024
    const shape = new THREE.Shape()
    roundedPath(shape, size.x - .008, height - .008, tag.radius)
    const hole = new THREE.Path()
    roundedPath(hole, size.x - .008 - thickness * 2, height - .008 - thickness * 2, Math.max(.005, tag.radius - thickness))
    shape.holes.push(hole)
    let material = materials.get(tag.view)
    if (!material) {
      material = new THREE.MeshBasicMaterial({ color: studioAccent[tag.view], transparent: true, opacity: 0, depthTest: true, depthWrite: false, toneMapped: false, fog: false })
      materials.set(tag.view, material)
    }
    const outline = new THREE.Mesh(new THREE.ShapeGeometry(shape, 5), material)
    outline.name = `StudioHighlight:${tag.view}`
    outline.visible = false
    outline.raycast = () => undefined
    if (tag.face === 'top') {
      outline.rotation.x = -Math.PI / 2
      outline.position.set(center.x, bounds.max.y + (tag.surfaceOffset ?? .003), center.z)
    } else outline.position.set(center.x, center.y, bounds.max.z + .003)
    mesh.add(outline)
    targets.push(mesh); outlines.push(outline)
  }
  options.canvas.dataset.studioHighlightTargets = String(targets.length)
  options.canvas.dataset.studioHover = ''
  const publish = (view: WorkArea | null) => {
    active = view
    options.canvas.dataset.studioHover = view ?? ''
    listeners.forEach((listener) => listener(view))
  }
  const hide = () => {
    sources.scene = null; sources.pill = null; sources.focus = null
    outlines.forEach((outline) => { outline.visible = false })
    materials.forEach((material) => { material.opacity = 0 })
    shown = null; targetOpacity = 0
    if (active !== null) { publish(null); options.requestRender() }
  }
  const reconcile = () => {
    if (!enabled()) { hide(); return }
    const next = sources.pill ?? sources.scene ?? sources.focus
    if (next === active) return
    if (next && next !== shown) {
      materials.forEach((material) => { material.opacity = 0 })
      shown = next
      outlines.forEach((outline) => { outline.visible = outline.parent?.userData.studioHighlight.view === next })
    }
    startOpacity = shown ? materials.get(shown)!.opacity : 0
    targetOpacity = next ? .72 : 0
    startedAt = performance.now()
    publish(next)
    options.requestRender()
  }
  const clear = () => { hide() }
  const onBlur = () => clear()
  const onVisibility = () => { if (document.hidden) clear() }
  window.addEventListener('blur', onBlur)
  document.addEventListener('visibilitychange', onVisibility)
  const unsubscribe = options.store.subscribe(() => { if (!enabled()) clear() })
  return {
    targets,
    set(source: Source, view: WorkArea | null) { sources[source] = view; reconcile() },
    clear,
    subscribe(listener: (view: WorkArea | null) => void) { listeners.add(listener); listener(active); return () => listeners.delete(listener) },
    update(now: number): boolean {
      if (!enabled()) { hide(); return false }
      if (!shown) return false
      const progress = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : THREE.MathUtils.clamp((now - startedAt) / 160, 0, 1)
      const eased = progress * (2 - progress)
      materials.get(shown)!.opacity = THREE.MathUtils.lerp(startOpacity, targetOpacity, eased)
      if (progress === 1 && targetOpacity === 0) {
        outlines.forEach((outline) => { outline.visible = false }); shown = null
      }
      return progress < 1
    },
    destroy() {
      clear(); unsubscribe(); listeners.clear()
      window.removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVisibility)
      outlines.forEach((outline) => { outline.removeFromParent(); outline.geometry.dispose() })
      materials.forEach((material) => material.dispose())
      delete options.canvas.dataset.studioHover; delete options.canvas.dataset.studioHighlightTargets
    },
  }
}
