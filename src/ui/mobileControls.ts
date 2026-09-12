import { projects, webProjectKeys } from '../data/projects'
import { MOBILE_MEDIA_QUERY } from '../config/responsive'
import type { StudioStore } from '../state/studioState'
import { requiredElement } from './dom'

export interface MobileControls {
  destroy(): void
}

export function createMobileControls(store: StudioStore, enterGameInspect: () => void, requestRender: () => void): MobileControls {
  const gameButton = requiredElement<HTMLButtonElement>('mobileGameInspect')
  const webSelector = requiredElement<HTMLElement>('mobileWebSelector')
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  gameButton.addEventListener('click', enterGameInspect)
  const buttons = webProjectKeys.map((key) => {
    const button = document.createElement('button')
    button.type = 'button'; button.textContent = projects[key].title; button.dataset.project = key
    button.addEventListener('click', () => { store.set({ selectedWebId: key }); requestRender() })
    webSelector.append(button); return button
  })
  const render = () => {
    const enabled = mediaQuery.matches
    gameButton.disabled = !enabled
    buttons.forEach((button) => {
      button.disabled = !enabled
      const active = button.dataset.project === store.get().selectedWebId
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active))
    })
  }
  const unsubscribe = store.subscribe(render)
  mediaQuery.addEventListener('change', render)
  render()

  return {
    destroy: () => {
      unsubscribe()
      mediaQuery.removeEventListener('change', render)
      gameButton.removeEventListener('click', enterGameInspect)
      buttons.forEach((button) => button.remove())
    },
  }
}
