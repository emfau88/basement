import * as THREE from 'three'
import { getInspectPreset, getMobileTransitionWaypoint, getViewPreset, type CameraPreset } from './presets'
import { getMobileRoutePlan, type MobileRouteFamily } from './mobileRoutes'
import type { InspectMode, MobileSheetState, StudioView } from '../state/studioState'
import { isLandscapeViewport, isMobileViewport } from '../config/responsive'

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
  private positionCurve: THREE.CatmullRomCurve3 | null = null
  private targetCurve: THREE.CatmullRomCurve3 | null = null
  private fovCurve: THREE.CatmullRomCurve3 | null = null
  private readonly curveFov = new THREE.Vector3()
  private currentView: StudioView = 'studio'
  private activeRouteFamily: MobileRouteFamily = 'direct'
  private activeMotion: 'direct' | 'curve' = 'direct'
  private studioYaw = 0
  private readonly studioDirection = new THREE.Vector3()
  private readonly verticalAxis = new THREE.Vector3(0, 1, 0)

  constructor(private readonly camera: THREE.PerspectiveCamera) {
    const preset = getViewPreset('studio')
    this.snapTo(preset)
  }

  moveToView(view: StudioView, sheet: MobileSheetState = 'collapsed'): void {
    const destination = getViewPreset(view, sheet)
    const distance = this.camera.position.distanceTo(new THREE.Vector3().fromArray(destination.position))
    const route = isMobileViewport()
      ? getMobileRoutePlan(this.currentView, view, distance)
      : { family: 'direct' as const, usesSafeCorridor: false }
    this.activeRouteFamily = route.family
    this.currentView = view
    if (route.usesSafeCorridor && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.moveAlongCurve(destination, getMobileTransitionWaypoint(), 1_200)
      return
    }
    this.moveTo(destination, view === 'studio' ? 950 : 1080)
  }

  adaptToSheet(view: StudioView, sheet: MobileSheetState): void {
    this.activeRouteFamily = 'direct'
    this.moveTo(getViewPreset(view, sheet), 460)
  }

  enterInspect(mode: Exclude<InspectMode, null>): void {
    this.activeRouteFamily = 'direct'
    this.moveTo(getInspectPreset(mode), 720)
  }

  exitInspect(view: StudioView, sheet: MobileSheetState = 'collapsed'): void {
    this.currentView = view
    this.activeRouteFamily = 'direct'
    this.moveTo(getViewPreset(view, sheet), 720)
  }

  resize(view: StudioView, inspectMode: InspectMode, sheet: MobileSheetState = 'collapsed'): void {
    this.currentView = view
    this.activeRouteFamily = 'direct'
    this.snapTo(inspectMode ? getInspectPreset(inspectMode) : getViewPreset(view, sheet))
  }

  update(now: number): boolean {
    if (!this.moving) return false
    // An already queued animation frame can carry a timestamp from just before
    // an interrupted route was restarted. Curves require a strict [0, 1] input.
    const progress = THREE.MathUtils.clamp((now - this.startedAt) / this.duration, 0, 1)
    const eased = cubicEaseInOut(progress)
    if (this.positionCurve && this.targetCurve && this.fovCurve) {
      this.positionCurve.getPoint(eased, this.camera.position)
      this.targetCurve.getPoint(eased, this.lookTarget)
      this.fovCurve.getPoint(eased, this.curveFov)
      this.camera.fov = this.curveFov.x
    } else {
      this.camera.position.lerpVectors(this.startPosition, this.endPosition, eased)
      this.lookTarget.lerpVectors(this.startTarget, this.endTarget, eased)
      this.camera.fov = THREE.MathUtils.lerp(this.startFov, this.endFov, eased)
    }
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(this.lookTarget)
    this.moving = progress < 1
    return this.moving
  }

  isMoving(): boolean {
    return this.moving
  }

  getActiveRouteFamily(): MobileRouteFamily {
    return this.activeRouteFamily
  }

  getActiveMotion(): 'direct' | 'curve' {
    return this.activeMotion
  }

  panStudio(horizontalFraction: number): number {
    if (this.currentView !== 'studio' || this.moving) return this.studioYaw
    const limit = THREE.MathUtils.degToRad(isMobileViewport() ? (isLandscapeViewport() ? 22 : 32) : 16)
    this.studioYaw = THREE.MathUtils.clamp(this.studioYaw + horizontalFraction * 1.2, -limit, limit)
    const preset = getViewPreset('studio')
    this.studioDirection.fromArray(preset.target).sub(this.camera.position).applyAxisAngle(this.verticalAxis, this.studioYaw)
    this.lookTarget.copy(this.camera.position).add(this.studioDirection)
    this.camera.lookAt(this.lookTarget)
    return this.studioYaw
  }

  recenterStudio(): boolean {
    if (this.currentView !== 'studio' || this.moving || this.studioYaw === 0) return false
    this.moveTo(getViewPreset('studio'), 460)
    return true
  }

  private moveTo(preset: CameraPreset, duration: number): void {
    this.activeMotion = 'direct'
    this.startMove(preset, duration, performance.now())
  }

  private moveAlongCurve(destination: CameraPreset, corridor: CameraPreset, duration: number): void {
    this.startMove(destination, duration, performance.now())
    const corridorPosition = new THREE.Vector3().fromArray(corridor.position)
    const corridorTarget = new THREE.Vector3().fromArray(corridor.target)
    this.positionCurve = new THREE.CatmullRomCurve3(
      [this.startPosition.clone(), corridorPosition, this.endPosition.clone()],
      false,
      'centripetal',
    )
    this.targetCurve = new THREE.CatmullRomCurve3(
      [this.startTarget.clone(), corridorTarget, this.endTarget.clone()],
      false,
      'centripetal',
    )
    this.fovCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(this.startFov, 0, 0),
        new THREE.Vector3(corridor.fov, 0, 0),
        new THREE.Vector3(this.endFov, 0, 0),
      ],
      false,
      'centripetal',
    )
    this.activeMotion = 'curve'
  }

  private startMove(preset: CameraPreset, duration: number, startedAt: number): void {
    this.studioYaw = 0
    this.positionCurve = null
    this.targetCurve = null
    this.fovCurve = null
    this.startPosition.copy(this.camera.position)
    this.endPosition.fromArray(preset.position)
    this.startTarget.copy(this.lookTarget)
    this.endTarget.fromArray(preset.target)
    this.startFov = this.camera.fov
    this.endFov = preset.fov
    this.startedAt = startedAt
    this.duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : duration
    this.moving = true
  }

  private snapTo(preset: CameraPreset): void {
    this.studioYaw = 0
    this.camera.position.fromArray(preset.position)
    this.lookTarget.fromArray(preset.target)
    this.camera.fov = preset.fov
    this.camera.updateProjectionMatrix()
    this.camera.lookAt(this.lookTarget)
    this.endPosition.copy(this.camera.position)
    this.startPosition.copy(this.camera.position)
    this.endTarget.copy(this.lookTarget)
    this.startTarget.copy(this.lookTarget)
    this.positionCurve = null
    this.targetCurve = null
    this.fovCurve = null
    this.activeMotion = 'direct'
    this.moving = false
  }
}
