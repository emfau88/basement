import * as THREE from 'three'
import { archiveProjectKeys, gameProjectKeys, projects, webProjectKeys, type ProjectKey } from '../data/projects'
import type { StudioStore } from '../state/studioState'
import { attachLiveTexture, calibratedCoverCrop, coverCrop, createLiveCanvas, loadProjectImages, roundRect, screenBase, topChrome, type LiveCanvas, type LoadedProjectImage } from './canvasUtils'

type ScreenType = 'games' | 'gamepan' | 'terminal' | 'apps' | 'appticker' | 'archive'
interface LiveScreen {
  type: ScreenType
  live: LiveCanvas
  items: LoadedProjectImage[]
  last: number
  currentKey?: ProjectKey
  apps?: readonly string[]
}

export interface LiveScreenSystem {
  registerGameSlideshow(mesh: THREE.Mesh): void
  registerGamePan(mesh: THREE.Mesh): void
  registerGameSelector(mesh: THREE.Mesh): void
  registerApps(mesh: THREE.Mesh): void
  registerAppSelector(mesh: THREE.Mesh): void
  registerArchive(mesh: THREE.Mesh): void
  selectGameFromHit(hit: THREE.Intersection): void
  selectWebFromHit(hit: THREE.Intersection): void
  getArchiveProject(): ProjectKey | undefined
  update(now: number): boolean
}

export function createLiveScreenSystem(store: StudioStore): LiveScreenSystem {
  const screens: LiveScreen[] = []

  const registerImageScreen = (mesh: THREE.Mesh, type: ScreenType, keys: readonly ProjectKey[], emissive: number) => {
    const live = createLiveCanvas(); attachLiveTexture(mesh, live, emissive)
    const screen: LiveScreen = { type, live, items: [], last: 0 }
    void loadProjectImages(keys).then((items) => { screen.items = items; screen.last = 0 })
    screens.push(screen)
  }

  const drawGames = (screen: LiveScreen, ms: number) => {
    const { context, texture } = screen.live; screenBase(context)
    if (!screen.items.length) { topChrome(context, 'GAMES'); context.fillStyle = '#e9eee7'; context.font = '700 34px Arial'; context.fillText('LOADING PROJECTS', 36, 218); texture.needsUpdate = true; return }
    const state = store.get()
    let item: LoadedProjectImage
    let fade = 0
    if (state.view === 'games') item = screen.items.find((candidate) => candidate.key === state.selectedGameId) ?? screen.items[0]!
    else {
      const interval = 6200; const raw = (ms / interval) % screen.items.length
      const index = Math.floor(raw); const fraction = raw - index; const next = (index + 1) % screen.items.length
      fade = Math.max(0, Math.min(1, (fraction - 0.84) / 0.16))
      calibratedCoverCrop(context, screen.items[index], 0, 48, 768, 384, 1.04, 0.5, 0.46 + Math.sin(ms * 0.00016) * 0.08)
      if (fade > 0) calibratedCoverCrop(context, screen.items[next], 0, 48, 768, 384, 1.04, 0.5, 0.5, fade)
      item = screen.items[fade > 0.5 ? next : index]!
    }
    if (state.view === 'games') calibratedCoverCrop(context, item, 0, 48, 768, 384, 1.06, 0.5, 0.44 + Math.sin(ms * 0.00022) * 0.05)
    screen.currentKey = item.key
    const gradient = context.createLinearGradient(0, 240, 0, 432); gradient.addColorStop(0, 'rgba(5,8,7,0)'); gradient.addColorStop(1, 'rgba(5,8,7,.92)')
    context.fillStyle = gradient; context.fillRect(0, 220, 768, 212); topChrome(context, state.view === 'games' ? 'SELECTED GAME' : 'GAMES', '#a9c58b')
    context.fillStyle = '#f4f5ef'; context.font = '800 31px Arial'; context.fillText(item.name, 28, 364)
    context.fillStyle = 'rgba(244,245,239,.66)'; context.font = '600 14px monospace'; context.fillText(item.tag ?? 'PLAYABLE PROJECT', 29, 391)
    if (state.view === 'games') { context.fillStyle = 'rgba(255,255,255,.12)'; context.fillRect(528, 18, 210, 20); context.fillStyle = '#eef3e8'; context.font = '700 12px monospace'; context.fillText('CLICK IMAGE FOR DETAILS', 544, 32) }
    texture.needsUpdate = true
  }

  const drawGamePan = (screen: LiveScreen, ms: number) => {
    const { context, texture } = screen.live; screenBase(context)
    if (!screen.items.length) { topChrome(context, 'PREVIEW'); texture.needsUpdate = true; return }
    const state = store.get()
    const item = state.view === 'games'
      ? screen.items.find((candidate) => candidate.key === state.selectedGameId) ?? screen.items[0]!
      : screen.items[Math.floor(ms / 8000) % screen.items.length]!
    screen.currentKey = item.key
    const phase = (ms % 9000) / 9000
    const panX = state.view === 'games' ? 0.32 + Math.sin(ms * 0.00035) * 0.12 : 0.2 + phase * 0.6
    const panY = state.view === 'games' ? 0.5 + Math.sin(ms * 0.0002) * 0.04 : 0.45 + Math.sin(phase * Math.PI * 2) * 0.08
    calibratedCoverCrop(context, item, 0, 48, 768, 384, 1.17, panX, panY)
    topChrome(context, state.view === 'games' ? 'PROJECT INFO' : 'PREVIEW', '#a9c58b')
    context.fillStyle = 'rgba(5,8,7,.76)'; context.fillRect(18, 266, 328, 136)
    context.fillStyle = '#f5f6ef'; context.font = '800 23px Arial'; context.fillText(item.name, 34, 300)
    const project = projects[item.key]
    const status = project.facts.find(([label]) => label === 'Status')?.[1] ?? 'Playable'
    const format = project.facts.find(([label]) => label === 'Format')?.[1] ?? 'Browser game'
    context.fillStyle = 'rgba(245,246,239,.72)'; context.font = '600 13px monospace'
    context.fillText(project.category.toUpperCase(), 34, 326); context.fillText(`STATUS   ${status.toUpperCase()}`, 34, 351); context.fillText(`FORMAT   ${format.toUpperCase()}`, 34, 375)
    if (state.view === 'games') context.fillText('LEFT SCREEN = SELECTOR', 34, 398)
    texture.needsUpdate = true
  }

  const drawGameSelector = (screen: LiveScreen) => {
    const { context, texture } = screen.live; const state = store.get(); screenBase(context, '#07100c'); topChrome(context, 'GAME SELECT', '#9cc58a')
    context.fillStyle = 'rgba(126,180,130,.06)'; for (let y = 48; y < 432; y += 24) context.fillRect(0, y, 768, 1)
    context.fillStyle = 'rgba(218,235,214,.56)'; context.font = '600 13px monospace'; context.fillText('Choose a project. The center screen updates instantly.', 24, 72)
    gameProjectKeys.forEach((key, index) => {
      const y = 86 + index * 58; const selected = key === state.selectedGameId; const project = projects[key]
      context.fillStyle = selected ? 'rgba(156,197,138,.22)' : 'rgba(255,255,255,.04)'; context.fillRect(22, y, 724, 46)
      context.fillStyle = selected ? '#a9c58b' : 'rgba(166,209,163,.56)'; context.font = '700 12px monospace'; context.fillText(String(index + 1).padStart(2, '0'), 38, y + 29)
      context.fillStyle = selected ? '#eef4ea' : '#d8ebd4'; context.font = '800 20px Arial'; context.fillText(project.title.toUpperCase(), 94, y + 28)
      context.fillStyle = 'rgba(218,235,214,.58)'; context.font = '500 12px monospace'; context.fillText(project.category.toUpperCase(), 96, y + 41)
      if (selected) { context.fillStyle = '#9cc58a'; context.fillRect(704, y + 12, 14, 22) }
    })
    context.fillStyle = 'rgba(218,235,214,.58)'; context.font = '600 12px monospace'
    context.fillText(state.inspectMode === 'gameSelector' ? 'TAP / CLICK A TITLE' : state.view === 'games' ? 'CLICK SCREEN TO ZOOM' : 'AUTO PLAY FROM DISTANCE', 24, 410)
    texture.needsUpdate = true
  }

  const drawApps = (screen: LiveScreen, ms: number) => {
    const { context, texture } = screen.live; const state = store.get(); context.fillStyle = '#c8c6be'; context.fillRect(0, 0, 768, 432)
    if (!screen.items.length) { context.fillStyle = '#17201d'; context.font = '700 32px Arial'; context.fillText('LOADING APPS', 34, 210); texture.needsUpdate = true; return }
    let item: LoadedProjectImage; let next: LoadedProjectImage | undefined; let fade = 0
    if (state.view === 'web') item = screen.items.find((candidate) => candidate.key === state.selectedWebId) ?? screen.items[0]!
    else { const interval = 6500; const index = Math.floor(ms / interval) % screen.items.length; item = screen.items[index]!; next = screen.items[(index + 1) % screen.items.length]; fade = Math.max(0, Math.min(1, ((ms % interval) / interval - 0.88) / 0.12)) }
    screen.currentKey = item.key
    context.fillStyle = '#1a211f'; context.fillRect(0, 0, 768, 46); context.fillStyle = '#cbd8cf'; context.font = '700 14px Arial'; context.fillText(state.view === 'web' ? 'EMFAU // SELECTED APP' : 'EMFAU // APPS', 24, 29)
    context.fillStyle = '#101714'; context.font = '800 42px Arial'; context.fillText(item.name, 402, 145); context.fillStyle = '#4f5c56'; context.font = '600 15px monospace'; context.fillText(item.tag ?? '', 403, 174)
    context.fillStyle = '#7a9d82'; context.fillRect(403, 205, 98, 4); context.fillStyle = '#505a55'; context.font = '500 14px Arial'; context.fillText('Published Android project', 403, 241); context.fillText(state.view === 'web' ? 'Use the small screen to browse apps' : 'Selected from the portfolio', 403, 266)
    context.fillStyle = '#1e2422'; roundRect(context, 82, 68, 246, 330, 26); context.fill()
    context.save(); roundRect(context, 96, 82, 218, 302, 20); context.clip(); context.save(); context.filter = 'brightness(.68) saturate(.88) contrast(.96)'; coverCrop(context, item.image, 96, 82, 218, 302); context.restore()
    if (state.view !== 'web' && fade > 0 && next) { context.save(); context.filter = 'brightness(.68) saturate(.88) contrast(.96)'; coverCrop(context, next.image, 96, 82, 218, 302, 1, 0.5, 0.5, fade); context.restore() }
    context.restore()
    if (state.view === 'web') { context.fillStyle = 'rgba(24,33,31,.08)'; context.fillRect(400, 308, 300, 64); context.fillStyle = '#16201c'; context.font = '700 14px monospace'; context.fillText('CLICK PREVIEW FOR DETAILS', 418, 336); context.fillStyle = '#63716c'; context.font = '500 13px Arial'; context.fillText('Manual browsing is active in this view.', 418, 358) }
    texture.needsUpdate = true
  }

  const drawAppSelector = (screen: LiveScreen, ms: number) => {
    const { context, texture } = screen.live; const state = store.get(); screenBase(context, '#101816')
    if (state.view === 'web') {
      topChrome(context, 'APP SELECT', '#8fb2bd'); context.fillStyle = 'rgba(223,231,223,.56)'; context.font = '600 12px monospace'; context.fillText('Choose an app. The large preview updates instantly.', 24, 76)
      webProjectKeys.forEach((key, index) => { const project = projects[key]; const y = 92 + index * 56; const selected = key === state.selectedWebId
        context.fillStyle = selected ? 'rgba(143,178,189,.22)' : 'rgba(255,255,255,.04)'; context.fillRect(24, y, 720, 42); context.fillStyle = selected ? '#8fb2bd' : 'rgba(223,231,223,.55)'; context.font = '700 12px monospace'; context.fillText(String(index + 1).padStart(2, '0'), 38, y + 26)
        context.fillStyle = selected ? '#eef5f3' : '#dfe7df'; context.font = '800 18px Arial'; context.fillText(project.title.toUpperCase(), 92, y + 25); context.fillStyle = 'rgba(223,231,223,.56)'; context.font = '500 11px monospace'; context.fillText(project.category.toUpperCase(), 94, y + 38); if (selected) { context.fillStyle = '#8fb2bd'; context.fillRect(705, y + 11, 14, 18) }
      })
      context.fillStyle = 'rgba(223,231,223,.56)'; context.font = '600 12px monospace'; context.fillText('TAP / CLICK A TITLE', 24, 404)
    } else {
      topChrome(context, 'APPS', '#8fb2bd'); const apps = screen.apps ?? []; const span = 150; const base = 768 - (ms * 0.065 % (apps.length * span + 768)); context.font = '800 21px Arial'
      apps.forEach((name, index) => { context.fillStyle = index % 2 ? '#dfe7df' : '#93b5bd'; context.fillText(name, base + index * span, 225) })
      context.fillStyle = 'rgba(255,255,255,.13)'; context.fillRect(24, 278, 720, 1); context.fillStyle = 'rgba(223,231,223,.56)'; context.font = '600 14px monospace'; context.fillText('FLUTTER · ANDROID · SHIPPED', 24, 320)
    }
    texture.needsUpdate = true
  }

  const drawArchive = (screen: LiveScreen, ms: number) => {
    const { context, texture } = screen.live; screenBase(context, '#10100d'); if (!screen.items.length) { texture.needsUpdate = true; return }
    const interval = 7200; const item = screen.items[Math.floor(ms / interval) % screen.items.length]!; screen.currentKey = item.key; const phase = (ms % interval) / interval
    coverCrop(context, item.image, 0, 0, 768, 432, 1.08, 0.5, 0.38 + phase * 0.22); context.fillStyle = 'rgba(52,31,25,.22)'; context.fillRect(0, 0, 768, 432)
    const roll = (ms * 0.035) % 432; context.fillStyle = 'rgba(255,230,205,.055)'; context.fillRect(0, roll, 768, 18); for (let y = 0; y < 432; y += 5) { context.fillStyle = 'rgba(20,8,5,.12)'; context.fillRect(0, y, 768, 1) }
    context.fillStyle = 'rgba(14,9,7,.75)'; context.fillRect(20, 337, 360, 62); context.fillStyle = '#e8d3c4'; context.font = '800 25px Arial'; context.fillText(item.name, 34, 372); context.fillStyle = 'rgba(232,211,196,.62)'; context.font = '600 13px monospace'; context.fillText('ARCHIVED // READ ONLY', 35, 392); texture.needsUpdate = true
  }

  return {
    registerGameSlideshow: (mesh) => registerImageScreen(mesh, 'games', gameProjectKeys, 0.5),
    registerGamePan: (mesh) => registerImageScreen(mesh, 'gamepan', ['territory_tide', 'pocket_pier', 'core_arena'], 0.46),
    registerGameSelector: (mesh) => { const live = createLiveCanvas(); attachLiveTexture(mesh, live, 0.38); screens.push({ type: 'terminal', live, items: [], last: 0 }) },
    registerApps: (mesh) => registerImageScreen(mesh, 'apps', ['between', 'zerohero', 'mirror', 'chargegeist'], 0.24),
    registerAppSelector: (mesh) => { const live = createLiveCanvas(); attachLiveTexture(mesh, live, 0.36); screens.push({ type: 'appticker', live, items: [], last: 0, apps: ['MIRROR', 'ZEROHERO', 'BETWEEN', 'CHARGEGEIST', 'MEWTRACK', 'MARSCHLEGENDEN'] }) },
    registerArchive: (mesh) => registerImageScreen(mesh, 'archive', archiveProjectKeys, 0.38),
    selectGameFromHit: (hit) => { const y = (1 - (hit.uv?.y ?? -1)) * 432; if (y < 86 || y > 86 + gameProjectKeys.length * 58) return; const key = gameProjectKeys[Math.floor((y - 86) / 58)]; if (key) store.set({ selectedGameId: key }) },
    selectWebFromHit: (hit) => { const y = (1 - (hit.uv?.y ?? -1)) * 432; if (y < 92 || y > 92 + webProjectKeys.length * 56) return; const key = webProjectKeys[Math.floor((y - 92) / 56)]; if (key) store.set({ selectedWebId: key }) },
    getArchiveProject: () => screens.find((screen) => screen.type === 'archive')?.currentKey,
    update: (now) => { let changed = false; for (const screen of screens) { if (now - screen.last < 90) continue; screen.last = now; changed = true; if (screen.type === 'games') drawGames(screen, now); else if (screen.type === 'gamepan') drawGamePan(screen, now); else if (screen.type === 'terminal') drawGameSelector(screen); else if (screen.type === 'apps') drawApps(screen, now); else if (screen.type === 'appticker') drawAppSelector(screen, now); else drawArchive(screen, now) } return changed },
  }
}
