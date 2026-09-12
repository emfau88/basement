import { projects, webProjectKeys } from '../data/projects'
import type { StudioStore } from '../state/studioState'
import { requiredElement } from './dom'

export function createMobileControls(store: StudioStore, enterGameInspect: () => void, requestRender: () => void): void {
  const gameButton = requiredElement<HTMLButtonElement>('mobileGameInspect')
  const webSelector = requiredElement<HTMLElement>('mobileWebSelector')
  gameButton.addEventListener('click', enterGameInspect)
  const buttons = webProjectKeys.map((key) => {
    const button = document.createElement('button')
    button.type = 'button'; button.textContent = projects[key].title; button.dataset.project = key
    button.addEventListener('click', () => { store.set({ selectedWebId: key }); requestRender() })
    webSelector.append(button); return button
  })
  const render = () => buttons.forEach((button) => {
    const active = button.dataset.project === store.get().selectedWebId
    button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active))
  })
  store.subscribe(render); render()
}
