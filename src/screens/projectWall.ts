import * as THREE from 'three'
import { featuredProjectKeys, projectPreviewImage, projects, type ProjectKey } from '../data/projects'
import {
  attachLiveTexture,
  calibratedCoverCrop,
  createLiveCanvas,
  loadRemoteImage,
  screenBase,
  setLiveCanvasResolution,
  type LiveCanvas,
  type LiveCanvasResolutionScale,
} from './canvasUtils'

export interface ProjectWall {
  setHover(card: THREE.Mesh | null): boolean
  setSelected(key: ProjectKey | null): boolean
  syncResolution(active: boolean): boolean
  getResolutionSnapshot(): { width: number, height: number, scale: LiveCanvasResolutionScale }
}

interface ProjectCardScreen {
  key: ProjectKey
  live: LiveCanvas
  image?: HTMLImageElement
  failed: boolean
  requestedFull: boolean
}

export function createProjectWall(cards: THREE.Mesh[], frames: THREE.Mesh[], textureAnisotropy = 4): ProjectWall {
  const cardScreens: ProjectCardScreen[] = []

  const drawCard = (screen: ProjectCardScreen) => {
    const project = projects[screen.key]
    const { context, texture } = screen.live
    screenBase(context, screen.failed ? '#4e5a54' : '#d8d3c7')
    if (!screen.image) {
      context.fillStyle = '#f1f1eb'; context.font = '800 28px Arial'; context.fillText(project.title, 28, 200)
      texture.needsUpdate = true
      return
    }
    calibratedCoverCrop(context, { key: screen.key, name: project.title, image: screen.image }, 0, 0, 768, 432, 1.05, 0.5, 0.48)
    context.save(); context.globalCompositeOperation = 'screen'; context.fillStyle = 'rgba(255,248,232,.09)'; context.fillRect(0, 0, 768, 432); context.restore()
    const gradient = context.createLinearGradient(0, 220, 0, 432); gradient.addColorStop(0, 'rgba(16,19,18,0)'); gradient.addColorStop(1, 'rgba(16,19,18,.84)')
    context.fillStyle = gradient; context.fillRect(0, 190, 768, 242); context.fillStyle = 'rgba(255,255,255,.14)'; context.fillRect(20, 18, 122, 28)
    context.fillStyle = '#f1f1eb'; context.font = '700 14px Arial'; context.fillText('FEATURED', 34, 37); context.font = '800 30px Arial'; context.fillText(project.title, 28, 350)
    context.fillStyle = 'rgba(241,241,235,.72)'; context.font = '600 15px monospace'; context.fillText(project.category, 29, 380); context.fillStyle = 'rgba(241,241,235,.62)'; context.font = '600 12px monospace'; context.fillText('TAP TO OPEN', 29, 401); texture.needsUpdate = true
  }

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
    const screen: ProjectCardScreen = { key, live, failed: false, requestedFull: false }
    cardScreens.push(screen)
    drawCard(screen)
    void loadRemoteImage(projectPreviewImage(project)).then((image) => {
      screen.image = image
      drawCard(screen)
    }).catch((error: unknown) => {
      console.warn('[project card asset]', error)
      screen.failed = true
      drawCard(screen)
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
    syncResolution: (active) => {
      const resolutionScale: LiveCanvasResolutionScale = active ? 2 : 1
      let changed = false
      cardScreens.forEach((screen) => {
        if (active && !screen.requestedFull) {
          screen.requestedFull = true
          void loadRemoteImage(projects[screen.key].image).then((image) => {
            screen.image = image
            drawCard(screen)
          }).catch((error: unknown) => console.warn('[project card full asset]', error))
        }
        if (!setLiveCanvasResolution(screen.live, resolutionScale)) return
        drawCard(screen)
        changed = true
      })
      return changed
    },
    getResolutionSnapshot: () => {
      const live = cardScreens[0]?.live
      return live
        ? { width: live.canvas.width, height: live.canvas.height, scale: live.resolutionScale }
        : { width: 768, height: 432, scale: 1 }
    },
  }
}

export const projectKeyForCard = (card: THREE.Mesh): ProjectKey | undefined => card.userData.projectKey as ProjectKey | undefined
