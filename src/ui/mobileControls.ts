import {
  archiveProjectKeys,
  featuredProjectKeys,
  gameProjectKeys,
  projects,
  webProjectKeys,
  type ProjectKey,
} from '../data/projects'
import { MOBILE_MEDIA_QUERY } from '../config/responsive'
import type { StudioState, StudioStore, StudioView } from '../state/studioState'
import { requiredElement } from './dom'
import { viewContent } from './navigation'

export interface MobileControls {
  destroy(): void
}

interface MobileControlOptions {
  store: StudioStore
  enterGameInspect(): void
  openProject(key: ProjectKey): void
  setFeaturedSelection(key: ProjectKey | null): void
  requestRender(): void
}

const viewIndex: Record<StudioView, string> = { studio: '00', games: '01', web: '02', projects: '03', archive: '04' }
const projectKeys: Record<Exclude<StudioView, 'studio'>, readonly ProjectKey[]> = {
  games: gameProjectKeys,
  web: webProjectKeys,
  projects: featuredProjectKeys,
  archive: archiveProjectKeys,
}
const viewCount: Record<Exclude<StudioView, 'studio'>, string> = {
  games: '4 projects', web: '4 projects', projects: '4 featured', archive: '4 entries',
}

const selectedKeyFor = (state: Readonly<StudioState>): ProjectKey | null => {
  if (state.view === 'games') return state.selectedGameId
  if (state.view === 'web') return state.selectedWebId
  if (state.view === 'projects') return state.selectedFeaturedId
  if (state.view === 'archive') return state.selectedArchiveId
  return null
}

export function createMobileControls(options: MobileControlOptions): MobileControls {
  const { store } = options
  const gameButton = requiredElement<HTMLButtonElement>('mobileGameInspect')
  const openButton = requiredElement<HTMLButtonElement>('mobileOpenProject')
  const track = requiredElement<HTMLElement>('mobileProjectTrack')
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
  const cardButtons = new Map<ProjectKey, HTMLButtonElement>()
  let renderedView: StudioView = 'studio'
  let scrollTimer = 0
  let pointerStartY = 0
  let handledGesture = false

  const setSelection = (view: Exclude<StudioView, 'studio'>, key: ProjectKey) => {
    if (view === 'games') store.set({ selectedGameId: key })
    else if (view === 'web') store.set({ selectedWebId: key })
    else if (view === 'projects') store.set({ selectedFeaturedId: key })
    else store.set({ selectedArchiveId: key })
    options.setFeaturedSelection(view === 'projects' ? key : null)
    options.requestRender()
  }

  const rebuildCards = (view: Exclude<StudioView, 'studio'>) => {
    cardButtons.clear()
    const cards = projectKeys[view].map((key) => {
      const project = projects[key]
      const card = document.createElement('button')
      card.type = 'button'; card.className = 'mobile-project-card'; card.dataset.project = key
      card.setAttribute('role', 'option'); card.setAttribute('aria-label', `Select ${project.title}`)
      const image = document.createElement('img')
      image.src = project.image; image.alt = ''; image.loading = 'lazy'; image.decoding = 'async'
      image.addEventListener('error', () => card.classList.add('image-fallback'), { once: true })
      const text = document.createElement('span'); text.className = 'mobile-project-card-copy'
      const tag = document.createElement('small'); tag.textContent = project.category
      const name = document.createElement('strong'); name.textContent = project.title
      text.append(tag, name); card.append(image, text)
      card.addEventListener('click', () => {
        setSelection(view, key)
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
      })
      cardButtons.set(key, card)
      return card
    })
    track.replaceChildren(...cards)
    track.setAttribute('aria-label', `Select ${view} project`)
  }

  const toggleSheet = () => {
    if (handledGesture) { handledGesture = false; return }
    if (!mediaQuery.matches || store.get().view === 'studio') return
    store.set({ mobileSheet: store.get().mobileSheet === 'expanded' ? 'collapsed' : 'expanded' })
  }
  const onPointerDown = (event: PointerEvent) => { pointerStartY = event.clientY; handledGesture = false }
  const onPointerUp = (event: PointerEvent) => {
    const distance = event.clientY - pointerStartY
    if (Math.abs(distance) < 32) return
    handledGesture = true
    store.set({ mobileSheet: distance > 0 ? 'collapsed' : 'expanded' })
  }
  const onTrackScroll = () => {
    window.clearTimeout(scrollTimer)
    scrollTimer = window.setTimeout(() => {
      const state = store.get(); if (state.view === 'studio') return
      const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2
      const closest = [...cardButtons.entries()].sort(([, a], [, b]) =>
        Math.abs(a.getBoundingClientRect().left + a.clientWidth / 2 - trackCenter)
        - Math.abs(b.getBoundingClientRect().left + b.clientWidth / 2 - trackCenter))[0]
      if (closest && closest[0] !== selectedKeyFor(state)) setSelection(state.view, closest[0])
    }, 120)
  }
  const onTrackKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    const state = store.get(); if (state.view === 'studio') return
    const keys = projectKeys[state.view]; const current = selectedKeyFor(state); const currentIndex = Math.max(0, keys.indexOf(current as ProjectKey))
    const nextIndex = Math.max(0, Math.min(keys.length - 1, currentIndex + (event.key === 'ArrowRight' ? 1 : -1)))
    const next = keys[nextIndex]; if (!next) return
    event.preventDefault(); setSelection(state.view, next); cardButtons.get(next)?.focus(); cardButtons.get(next)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }
  const onOpen = () => { const key = selectedKeyFor(store.get()); if (key) options.openProject(key) }

  gameButton.addEventListener('click', options.enterGameInspect)
  openButton.addEventListener('click', onOpen)
  toggle.addEventListener('click', toggleSheet)
  toggle.addEventListener('pointerdown', onPointerDown)
  toggle.addEventListener('pointerup', onPointerUp)
  track.addEventListener('scroll', onTrackScroll, { passive: true })
  track.addEventListener('keydown', onTrackKeyDown)

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
    if (!enabled || state.view !== 'projects') options.setFeaturedSelection(null)
    if (state.view !== 'studio') {
      const content = viewContent[state.view]
      if (renderedView !== state.view) { renderedView = state.view; rebuildCards(state.view) }
      index.textContent = viewIndex[state.view]
      label.textContent = state.view
      count.textContent = viewCount[state.view]
      kicker.textContent = content.eyebrow
      title.textContent = content.title
      copy.textContent = content.copy
      const selectedKey = selectedKeyFor(state)
      cardButtons.forEach((button, key) => {
        const active = key === selectedKey
        button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1
      })
      if (enabled && state.view === 'projects' && selectedKey) options.setFeaturedSelection(selectedKey)
      openButton.setAttribute('aria-label', `Open details for ${selectedKey ? projects[selectedKey].title : 'project'}`)
      gameButton.hidden = state.view !== 'games'
    }
  }
  const unsubscribe = store.subscribe(render)
  mediaQuery.addEventListener('change', render)
  render()

  return {
    destroy: () => {
      window.clearTimeout(scrollTimer); unsubscribe(); mediaQuery.removeEventListener('change', render)
      gameButton.removeEventListener('click', options.enterGameInspect); openButton.removeEventListener('click', onOpen)
      toggle.removeEventListener('click', toggleSheet); toggle.removeEventListener('pointerdown', onPointerDown); toggle.removeEventListener('pointerup', onPointerUp)
      track.removeEventListener('scroll', onTrackScroll); track.removeEventListener('keydown', onTrackKeyDown); track.replaceChildren()
    },
  }
}
