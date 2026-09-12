import * as THREE from 'three'
import { getInspectPreset, getViewPreset, type CameraPreset } from './presets'
import type { MobileSheetState, StudioView } from '../state/studioState'

const cubicEaseInOut = (value: number) => value < 0.5
  ? 4 * value * value * value
  : 1 - Math.pow(-2 * value + 2, 3) / 2

export class CameraController {
  private readonly startPosition = new THREE.Vector3()
  private readonly endPosition = new THREE.Vector3()
  private readonly startTarget = new THREE.Vector3()
  private readonly endTarget = new THREE.Vector3()
  private readonly lookTarget = new THREE.Vector3()
  private startFov = 48
  private endFov = 48
  private startedAt = performance.now()
  private duration = 0
  private moving = false

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    const preset = getViewPreset('studio')
    this.snapTo(preset)
  }

  moveToView(view: StudioView, sheet: MobileSheetState = 'collapsed'): void {
    this.moveTo(getViewPreset(view, sheet), view === 'studio' ? 950 : 1080)
  }

  adaptToSheet(view: StudioView, sheet: MobileSheetState): void {
    this.moveTo(getViewPreset(view, sheet), 460)
  }

  enterGameSelector(): void {
    this.moveTo(getInspectPreset(), 720)
  }

  exitInspect(view: StudioView, sheet: MobileSheetState = 'collapsed'): void {
    this.moveTo(getViewPreset(view, sheet), 720)
  }

  resize(view: StudioView, inspecting: boolean, sheet: MobileSheetState = 'collapsed'): void {
    this.snapTo(inspecting ? getInspectPreset() : getViewPreset(view, sheet))
  }

  update(now: number): boolean {
    if (!this.moving) return false
    const progress = Math.min(1, (now - this.startedAt) / this.duration)
    const eased = cubicEaseInOut(progress)
    this.camera.position.lerpVectors(this.startPosition, this.endPosition, eased)
    this.lookTarget.lerpVectors(this.startTarget, this.endTarget, eased)
    this.camera.fov = THREE.MathUtils.lerp(this.startFov, this.endFov, eased)
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(this.lookTarget)
    this.moving = progress < 1
    return this.moving
  }

  isMoving(): boolean {
    return this.moving
  }

  private moveTo(preset: CameraPreset, duration: number): void {
    this.startPosition.copy(this.camera.position)
    this.endPosition.fromArray(preset.position)
    this.startTarget.copy(this.lookTarget)
    this.endTarget.fromArray(preset.target)
    this.startFov = this.camera.fov
    this.endFov = preset.fov
    this.startedAt = performance.now()
    this.duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : duration
    this.moving = true
  }

  private snapTo(preset: CameraPreset): void {
    this.camera.position.fromArray(preset.position)
    this.lookTarget.fromArray(preset.target)
    this.camera.fov = preset.fov
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(this.lookTarget)
    this.endPosition.copy(this.camera.position)
    this.startPosition.copy(this.camera.position)
    this.endTarget.copy(this.lookTarget)
    this.startTarget.copy(this.lookTarget)
    this.moving = false
  }
}
