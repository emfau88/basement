import * as THREE from 'three'
import type { StudioView } from '../state/studioState'

export interface Hotspot extends THREE.Mesh {
  userData: { view: StudioView; label: string }
}

export function createHotspots(scene: THREE.Scene): Hotspot[] {
  const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
  const definitions: ReadonlyArray<readonly [StudioView, string, readonly [number, number, number], readonly [number, number, number]]> = [
    ['games', 'Open Games', [5, 3, 2.1], [0, 1.65, -3.45]],
    ['web', 'Open Web Work', [3.3, 3.1, 2.1], [5, 1.65, -3.05]],
    ['projects', 'Open Projects', [2.7, 3, 3.1], [6.35, 1.6, 1.65]],
    ['archive', 'Open Archive', [3.2, 3.8, 3.2], [-5.85, 1.9, -4.15]],
  ]
  return definitions.map(([view, label, size, position]) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material.clone()) as unknown as Hotspot
    mesh.position.set(...position); mesh.userData = { view, label }; scene.add(mesh); return mesh
  })
}
