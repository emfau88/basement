import type { StudioStore, StudioView } from '../state/studioState'
import { archiveProjectKeys, gameProjectKeys, projects, type ProjectKey } from '../data/projects'
import { requiredElement } from './dom'

export interface ViewContent {
  eyebrow: string
  title: string
  copy: string
  rows: ReadonlyArray<readonly [string, string]>
}

const projectRows = (keys: readonly ProjectKey[]): ReadonlyArray<readonly [string, string]> => keys.map((key) => {
  const project = projects[key]
  return [project.title, project.facts.find(([label]) => label === 'Focus')?.[1] ?? project.category] as const
})

export const viewContent: Record<Exclude<StudioView, 'studio'>, ViewContent> = {
  games: { eyebrow: '01 / Games', title: 'Playable ideas.', copy: 'The main desk is the game-dev station: builds, testing and released projects.', rows: projectRows(gameProjectKeys) },
  web: { eyebrow: '02 / Web', title: 'Selected web work.', copy: 'Use the small screen to browse; open the large preview for details.', rows: [['Apps', 'Manual browser'], ['Preview', 'Large screen'], ['Tap', 'Open details']] },
  projects: { eyebrow: '03 / Projects', title: 'Currently building.', copy: 'Four selected projects. Tap a wall card to open it.', rows: [['Gallery', '4 featured cards'], ['Tap', 'Open project'], ['View', 'Frontal focus']] },
  archive: { eyebrow: '04 / Archive', title: 'Not everything survives.', copy: 'The archive shelves and retro terminal keep retired projects visible instead of hiding them.', rows: projectRows(archiveProjectKeys) },
}

export interface NavigationUI {
  render(): void
  destroy(): void
}

export function createNavigationUI(store: StudioStore, navigate: (view: StudioView) => void): NavigationUI {
  const eyebrow = requiredElement<HTMLElement>('eyebrow')
  const title = requiredElement<HTMLElement>('title')
  const copy = requiredElement<HTMLElement>('copy')
  const rows = requiredElement<HTMLElement>('rows')
  const close = requiredElement<HTMLButtonElement>('close')
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('.nav button[data-view]')]

  const render = () => {
    const { view, inspectMode } = store.get()
    document.body.classList.remove('view-studio', 'view-games', 'view-web', 'view-projects', 'view-archive')
    document.body.classList.add(`view-${view}`)
    document.body.classList.toggle('focus', view !== 'studio')
    document.body.classList.toggle('inspect-selector', inspectMode === 'gameSelector')
    buttons.forEach((button) => {
      const active = button.dataset.view === view
      button.classList.toggle('active', active)
      button.setAttribute('aria-current', active ? 'page' : 'false')
    })
    if (view === 'studio') return
    const content = viewContent[view]
    eyebrow.textContent = content.eyebrow; title.textContent = content.title; copy.textContent = content.copy
    rows.replaceChildren(...content.rows.map(([label, value]) => {
      const row = document.createElement('div'); row.className = 'row'
      const strong = document.createElement('b'); strong.textContent = label
      const span = document.createElement('span'); span.textContent = value
      row.append(strong, span); return row
    }))
  }

  const onButtonClick = (event: Event) => {
    const view = (event.currentTarget as HTMLButtonElement).dataset.view as StudioView | undefined
    if (view) navigate(view)
  }
  buttons.forEach((button) => button.addEventListener('click', onButtonClick))
  const onClose = () => navigate('studio')
  close.addEventListener('click', onClose)
  const unsubscribe = store.subscribe(render)
  render()

  return { render, destroy: () => { unsubscribe(); buttons.forEach((button) => button.removeEventListener('click', onButtonClick)); close.removeEventListener('click', onClose) } }
}
