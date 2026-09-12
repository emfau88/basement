import { projects, webProjectKeys } from '../data/projects'
import { MOBILE_MEDIA_QUERY } from '../config/responsive'
import type { StudioStore, StudioView } from '../state/studioState'
import { requiredElement } from './dom'
import { viewContent } from './navigation'

export interface MobileControls {
  destroy(): void
}

export function createMobileControls(store: StudioStore, enterGameInspect: () => void, requestRender: () => void): MobileControls {
  const gameButton = requiredElement<HTMLButtonElement>('mobileGameInspect')
  const webSelector = requiredElement<HTMLElement>('mobileWebSelector')
  const sheet = requiredElement<HTMLElement>('mobileSheet')
  const toggle = requiredElement<HTMLButtonElement>('mobileSheetToggle')
  const panel = requiredElement<HTMLElement>('mobileSheetPanel')
  const index = requiredElement<HTMLElement>('mobileSheetIndex')
  const label = requiredElement<HTMLElement>('mobileSheetLabel')
  const count = requiredElement<HTMLElement>('mobileSheetCount')
  const kicker = requiredElement<HTMLElement>('mobileSheetKicker')
  const title = requiredElement<HTMLElement>('mobileSheetTitle')
  const copy = requiredElement<HTMLElement>('mobileSheetCopy')
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  gameButton.addEventListener('click', enterGameInspect)
  const viewIndex: Record<StudioView, string> = { studio: '00', games: '01', web: '02', projects: '03', archive: '04' }
  const viewCount: Record<Exclude<StudioView, 'studio'>, string> = {
    games: '4 projects', web: '4 projects', projects: '4 featured', archive: '4 entries',
  }
  const buttons = webProjectKeys.map((key) => {
    const button = document.createElement('button')
    button.type = 'button'; button.textContent = projects[key].title; button.dataset.project = key
    button.addEventListener('click', () => { store.set({ selectedWebId: key }); requestRender() })
    webSelector.append(button); return button
  })
  const toggleSheet = () => {
    if (!mediaQuery.matches || store.get().view === 'studio') return
    store.set({ mobileSheet: store.get().mobileSheet === 'expanded' ? 'collapsed' : 'expanded' })
  }
  toggle.addEventListener('click', toggleSheet)
  const render = () => {
    const enabled = mediaQuery.matches
    const state = store.get()
    const expanded = enabled && state.view !== 'studio' && state.mobileSheet === 'expanded'
    document.body.classList.toggle('mobile-sheet-expanded', expanded)
    sheet.setAttribute('aria-hidden', String(!enabled || state.view === 'studio'))
    sheet.inert = !enabled || state.view === 'studio' || state.inspectMode !== null
    toggle.setAttribute('aria-expanded', String(expanded))
    panel.setAttribute('aria-hidden', String(!expanded))
    panel.inert = !expanded
    if (state.view !== 'studio') {
      const content = viewContent[state.view]
      index.textContent = viewIndex[state.view]
      label.textContent = state.view
      count.textContent = viewCount[state.view]
      kicker.textContent = content.eyebrow
      title.textContent = content.title
      copy.textContent = content.copy
    }
    gameButton.disabled = !enabled
    buttons.forEach((button) => {
      button.disabled = !enabled
      const active = button.dataset.project === state.selectedWebId
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
      toggle.removeEventListener('click', toggleSheet)
      buttons.forEach((button) => button.remove())
    },
  }
}
