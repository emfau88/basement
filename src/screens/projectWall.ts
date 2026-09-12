import * as THREE from 'three'
import { featuredProjectKeys, projects, type ProjectKey } from '../data/projects'
import { attachLiveTexture, calibratedCoverCrop, createLiveCanvas, loadRemoteImage, screenBase } from './canvasUtils'

export interface ProjectWall {
  setHover(card: THREE.Mesh | null): boolean
}

export function createProjectWall(cards: THREE.Mesh[], frames: THREE.Mesh[]): ProjectWall {
  cards.forEach((card, index) => {
    const key = featuredProjectKeys[index]
    const frame = frames[index]
    if (!key || !frame) return
    card.userData.hoverFrame = frame
    card.userData.projectKey = key
    card.userData.section = 'projects'
    card.userData.detailLabel = 'Open project'
    const project = projects[key]
    const live = createLiveCanvas(); attachLiveTexture(card, live, 0.015)
    void loadRemoteImage(project.image).then((image) => {
      const { context, texture } = live; screenBase(context, '#d8d3c7')
      calibratedCoverCrop(context, { key, name: project.title, image }, 0, 0, 768, 432, 1.05, 0.5, 0.48)
      const gradient = context.createLinearGradient(0, 220, 0, 432); gradient.addColorStop(0, 'rgba(16,19,18,0)'); gradient.addColorStop(1, 'rgba(16,19,18,.84)')
      context.fillStyle = gradient; context.fillRect(0, 190, 768, 242); context.fillStyle = 'rgba(255,255,255,.14)'; context.fillRect(20, 18, 122, 28)
      context.fillStyle = '#f1f1eb'; context.font = '700 14px Arial'; context.fillText('FEATURED', 34, 37); context.font = '800 30px Arial'; context.fillText(project.title, 28, 350)
      context.fillStyle = 'rgba(241,241,235,.72)'; context.font = '600 15px monospace'; context.fillText(project.category, 29, 380); context.fillStyle = 'rgba(241,241,235,.62)'; context.font = '600 12px monospace'; context.fillText('TAP TO OPEN', 29, 401); texture.needsUpdate = true
    }).catch((error: unknown) => {
      console.warn('[project card asset]', error)
      const { context, texture } = live; screenBase(context, '#4e5a54'); context.fillStyle = '#f1f1eb'; context.font = '800 28px Arial'; context.fillText(project.title, 28, 200); texture.needsUpdate = true
    })
  })

  let hovered: THREE.Mesh | null = null
  return {
    setHover: (card) => {
      if (hovered === card) return false
      if (hovered) {
        const frame = hovered.userData.hoverFrame as THREE.Mesh | undefined
        if (frame?.material instanceof THREE.Material) frame.material.opacity = 0
        hovered.scale.set(1, 1, 1)
      }
      hovered = card
      if (hovered) {
        const frame = hovered.userData.hoverFrame as THREE.Mesh | undefined
        if (frame?.material instanceof THREE.Material) frame.material.opacity = 0.82
        hovered.scale.set(1.025, 1.025, 1.025)
      }
      return true
    },
  }
}

export const projectKeyForCard = (card: THREE.Mesh): ProjectKey | undefined => card.userData.projectKey as ProjectKey | undefined
