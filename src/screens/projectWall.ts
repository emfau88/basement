import * as THREE from 'three'
import { featuredProjectKeys, projects, type ProjectKey } from '../data/projects'
import { attachLiveTexture, calibratedCoverCrop, createLiveCanvas, loadRemoteImage, screenBase } from './canvasUtils'

export interface ProjectWall {
  setHover(card: THREE.Mesh | null): boolean
  setSelected(key: ProjectKey | null): boolean
}

export function createProjectWall(cards: THREE.Mesh[], frames: THREE.Mesh[], textureAnisotropy = 4): ProjectWall {
  cards.forEach((card, index) => {
    const key = featuredProjectKeys[index]
    const frame = frames[index]
    if (!key || !frame) return
    card.userData.hoverFrame = frame
    card.userData.projectKey = key
    card.userData.section = 'projects'
    card.userData.detailLabel = 'Open project'
    const project = projects[key]
    const live = createLiveCanvas(textureAnisotropy); attachLiveTexture(card, live, 0.28)
    void loadRemoteImage(project.image).then((image) => {
      const { context, texture } = live; screenBase(context, '#d8d3c7')
      calibratedCoverCrop(context, { key, name: project.title, image }, 0, 0, 768, 432, 1.05, 0.5, 0.48)
      context.save(); context.globalCompositeOperation = 'screen'; context.fillStyle = 'rgba(255,248,232,.09)'; context.fillRect(0, 0, 768, 432); context.restore()
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
  let selectedKey: ProjectKey | null = null
  const updateCard = (card: THREE.Mesh) => {
    const frame = card.userData.hoverFrame as THREE.Mesh | undefined
    const hoveredCard = hovered === card
    const selectedCard = selectedKey === card.userData.projectKey
    if (frame?.material instanceof THREE.Material) frame.material.opacity = hoveredCard ? 1 : selectedCard ? 0.56 : 0
    const scale = hoveredCard ? 1.025 : selectedCard ? 1.014 : 1
    card.scale.set(scale, scale, scale)
  }
  return {
    setHover: (card) => {
      if (hovered === card) return false
      const previous = hovered
      hovered = card
      if (previous) updateCard(previous)
      if (hovered) updateCard(hovered)
      return true
    },
    setSelected: (key) => {
      if (selectedKey === key) return false
      selectedKey = key
      cards.forEach(updateCard)
      return true
    },
  }
}

export const projectKeyForCard = (card: THREE.Mesh): ProjectKey | undefined => card.userData.projectKey as ProjectKey | undefined
