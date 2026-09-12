import { projects, type ProjectKey } from '../data/projects'
import type { StudioStore } from '../state/studioState'
import { requiredElement } from './dom'

export interface ProjectModal {
  open(key: ProjectKey): void
  close(): void
  isOpen(): boolean
}

export function createProjectModal(store: StudioStore): ProjectModal {
  const backdrop = requiredElement<HTMLElement>('projectBackdrop')
  const panel = requiredElement<HTMLElement>('projectPanel')
  const image = requiredElement<HTMLImageElement>('projectImage')
  const tag = requiredElement<HTMLElement>('projectTag')
  const title = requiredElement<HTMLElement>('projectTitle')
  const summary = requiredElement<HTMLElement>('projectSummary')
  const meta = requiredElement<HTMLElement>('projectMeta')
  const actions = requiredElement<HTMLElement>('projectActions')
  const closeButton = requiredElement<HTMLButtonElement>('projectClose')
  let previouslyFocused: HTMLElement | null = null

  const close = () => {
    if (!document.body.classList.contains('project-open')) return
    document.body.classList.remove('project-open')
    panel.setAttribute('aria-hidden', 'true')
    panel.inert = true
    store.set({ openProjectId: null })
    previouslyFocused?.focus()
  }

  const open = (key: ProjectKey) => {
    const project = projects[key]
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    image.hidden = false; image.src = project.image; image.alt = project.title
    image.onerror = () => { image.hidden = true; image.parentElement?.setAttribute('data-fallback', project.title) }
    image.onload = () => image.parentElement?.removeAttribute('data-fallback')
    const visual = project.display
    image.style.filter = `brightness(${Math.min(1, visual.brightness + 0.08)}) saturate(${visual.saturation}) contrast(${visual.contrast})`
    tag.textContent = project.category; title.textContent = project.title; summary.textContent = project.summary
    meta.replaceChildren(...project.facts.map(([label, value]) => {
      const row = document.createElement('div'); row.className = 'mrow'
      const strong = document.createElement('b'); strong.textContent = label
      const span = document.createElement('span'); span.textContent = value
      row.append(strong, span); return row
    }))
    const links = project.links.map(([label, url], index) => {
      const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = label
      if (index > 0) link.className = 'secondary'
      link.setAttribute('aria-label', `${label} for ${project.title} (opens in a new tab)`)
      return link
    })
    const dismiss = document.createElement('button'); dismiss.type = 'button'; dismiss.className = 'secondary'; dismiss.textContent = 'Close'; dismiss.addEventListener('click', close)
    actions.replaceChildren(...links, dismiss)
    document.body.classList.add('project-open'); panel.setAttribute('aria-hidden', 'false'); panel.inert = false; store.set({ openProjectId: key })
    closeButton.focus()
  }

  backdrop.addEventListener('click', close)
  closeButton.addEventListener('click', close)
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return
    const focusable = [...panel.querySelectorAll<HTMLElement>('button, a[href]')].filter((element) => !element.hidden)
    const first = focusable[0]; const last = focusable.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  })

  return { open, close, isOpen: () => document.body.classList.contains('project-open') }
}
