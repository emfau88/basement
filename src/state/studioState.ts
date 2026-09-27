import type { ProjectKey } from '../data/projects'

export type StudioView = 'studio' | 'games' | 'web' | 'projects' | 'archive'
export type InspectMode = 'gameSelector' | 'gamePreview' | 'archiveCemetery' | null
export type MobileSheetState = 'collapsed' | 'expanded'

export interface StudioState {
  view: StudioView
  inspectMode: InspectMode
  mobileSheet: MobileSheetState
  selectedGameId: ProjectKey
  selectedWebId: ProjectKey
  selectedFeaturedId: ProjectKey
  selectedArchiveId: ProjectKey
  openProjectId: ProjectKey | null
}

type Listener = (state: Readonly<StudioState>) => void

export interface StudioStore {
  get(): Readonly<StudioState>
  set(patch: Partial<StudioState>): void
  subscribe(listener: Listener): () => void
}

export function createStudioStore(): StudioStore {
  let state: StudioState = {
    view: 'studio', inspectMode: null, mobileSheet: 'collapsed', selectedGameId: 'territory_tide', selectedWebId: 'mirror',
    selectedFeaturedId: 'rooster_rage', selectedArchiveId: 'cozy_bunker', openProjectId: null,
  }
  const listeners = new Set<Listener>()
  return {
    get: () => state,
    set: (patch) => {
      const next = { ...state, ...patch }
      if (Object.keys(patch).every((key) => state[key as keyof StudioState] === next[key as keyof StudioState])) return
      state = next
      listeners.forEach((listener) => listener(state))
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
