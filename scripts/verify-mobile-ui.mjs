import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
const readScreenResolutions = async (page) => JSON.parse(await page.locator('canvas').getAttribute('data-screen-resolutions') ?? '{}')
const hasScale = (snapshot, types, scale) => types.every((type) => snapshot.live?.find((screen) => screen.type === type)?.scale === scale)
const isBenignRendererWarning = (message) => message.text().startsWith('THREE.WebGLProgram: Program Info Log:') && message.text().includes('warning X4122')
const outputDirectory = path.resolve('docs/qa/current')
await mkdir(outputDirectory, { recursive: true })

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the QA server port')
const baseUrl = `http://127.0.0.1:${address.port}/`

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await desktop.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await desktop.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  await desktop.locator('.nav button[data-view="games"]').click()
  await desktop.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('canvas')?.dataset.gamesProof ?? ''))
  assert(await desktop.locator('canvas').getAttribute('data-hero-models') === 'desktop-ready', 'Desktop hero models did not load')
  assert(await desktop.locator('body').evaluate((body) => !body.classList.contains('mobile-ui')), 'Desktop activated mobile UI')
  assert(await desktop.locator('canvas').getAttribute('data-quality') === 'desktop', 'Desktop render profile is incorrect')
  assert(await desktop.locator('canvas').getAttribute('data-scene-detail') === '160', 'Desktop scene detail budget is incorrect')
  assert(await desktop.locator('.info').evaluate((element) => getComputedStyle(element).display !== 'none'), 'Desktop information card disappeared')
  assert(await desktop.locator('#mobileSheet').evaluate((element) => getComputedStyle(element).display === 'none'), 'Desktop rendered the mobile sheet')
  const gamesResolution = await readScreenResolutions(desktop)
  assert(hasScale(gamesResolution, ['games'], 2), 'The focal Games screen did not switch to 1536x864')
  assert(hasScale(gamesResolution, ['gamepan', 'terminal', 'apps', 'appticker', 'archive'], 1), 'Non-focal screens did not retain the efficient base resolution in Games')
  assert(gamesResolution.projects?.scale === 1, 'Distant project cards did not retain the efficient base resolution in Games')
  await desktop.locator('canvas').click({ position: { x: 430, y: 430 } })
  assert(await desktop.locator('body').evaluate((body) => body.classList.contains('inspect-selector')), 'Desktop Game Select inspect view did not open')
  assert(await desktop.locator('#inspectBack').textContent() === '← GAMES OVERVIEW', 'Game Select has the wrong return label')
  const selectorResolution = await readScreenResolutions(desktop)
  assert(hasScale(selectorResolution, ['terminal'], 2) && hasScale(selectorResolution, ['games', 'gamepan'], 1), 'Game Select did not receive exclusive high-resolution focus')
  await desktop.screenshot({ path: path.join(outputDirectory, 'desktop-1440x900-game-select.jpg'), type: 'jpeg', quality: 84 })
  await desktop.locator('canvas').click({ position: { x: 520, y: 400 } })
  await desktop.waitForTimeout(150)
  assert(await desktop.locator('body').evaluate((body) => body.classList.contains('inspect-selector')), 'Game preview did not keep its inspect state')
  assert(await desktop.locator('#inspectBack').textContent() === '← GAME SELECT', 'Game preview has the wrong return label')
  const gamePreviewResolution = await readScreenResolutions(desktop)
  assert(hasScale(gamePreviewResolution, ['games'], 2) && hasScale(gamePreviewResolution, ['terminal', 'gamepan'], 1), 'Game preview did not receive exclusive high-resolution focus')
  await desktop.screenshot({ path: path.join(outputDirectory, 'desktop-1440x900-game-preview.jpg'), type: 'jpeg', quality: 84 })
  await desktop.locator('canvas').click({ position: { x: 720, y: 430 } })
  assert(await desktop.locator('body').evaluate((body) => body.classList.contains('project-open')), 'Selected game did not open from the main preview')
  assert((await desktop.locator('#projectTitle').textContent()).includes('Core Arena'), 'The selected game was not carried into the main preview')
  await desktop.locator('#projectClose').click()
  await desktop.locator('#inspectBack').click()
  assert(await desktop.locator('#inspectBack').textContent() === '← GAMES OVERVIEW', 'Game preview did not return to Game Select')
  await desktop.locator('#inspectBack').click()
  assert(await desktop.locator('body').evaluate((body) => !body.classList.contains('inspect-selector')), 'Game Select did not return to Games overview')
  await desktop.locator('.nav button[data-view="web"]').click()
  const webResolution = await readScreenResolutions(desktop)
  assert(hasScale(webResolution, ['apps', 'appticker'], 2), 'Active Web screens did not switch to 1536x864')
  assert(hasScale(webResolution, ['games', 'gamepan', 'terminal', 'archive'], 1), 'Distant screens did not retain the base resolution in Web')
  await desktop.locator('.nav button[data-view="projects"]').click()
  const projectsResolution = await readScreenResolutions(desktop)
  assert(projectsResolution.projects?.scale === 2, 'Active project cards did not switch to 1536x864')
  assert(hasScale(projectsResolution, ['games', 'gamepan', 'terminal', 'apps', 'appticker', 'archive'], 1), 'Distant live screens did not retain the base resolution in Projects')
  await desktop.locator('canvas').click({ position: { x: 835, y: 535 } })
  assert(await desktop.locator('#projectTitle').textContent() === 'Mirror', 'Desktop Mirror card did not open')
  const desktopModal = await desktop.locator('#projectPanel').evaluate((panel) => {
    const rect = panel.getBoundingClientRect()
    const close = panel.querySelector('#projectClose')?.getBoundingClientRect()
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewportHeight: window.innerHeight,
      closeVisible: Boolean(close && close.top >= 0 && close.bottom <= window.innerHeight),
    }
  })
  assert(desktopModal.top >= 0 && desktopModal.bottom <= desktopModal.viewportHeight, 'Desktop project modal exceeds the viewport')
  assert(desktopModal.closeVisible, 'Desktop project modal close control is outside the viewport')
  await desktop.locator('#projectClose').click()
  await desktop.locator('.nav button[data-view="archive"]').click()
  const archiveResolution = await readScreenResolutions(desktop)
  assert(hasScale(archiveResolution, ['archive'], 2), 'Active Archive screen did not switch to 1536x864')
  assert(hasScale(archiveResolution, ['games', 'gamepan', 'terminal', 'apps', 'appticker'], 1), 'Distant screens did not retain the base resolution in Archive')
  await desktop.locator('canvas').click({ position: { x: 605, y: 350 } })
  assert(await desktop.locator('body').evaluate((body) => body.classList.contains('inspect-selector')), 'Desktop Archive cemetery inspect view did not open')
  assert(await desktop.locator('#inspectBack').textContent() === '← ARCHIVE LOUNGE', 'Desktop Archive inspect view has the wrong return label')
  await desktop.locator('canvas').hover({ position: { x: 1080, y: 470 } })
  await desktop.waitForTimeout(120)
  await desktop.screenshot({ path: path.join(outputDirectory, 'desktop-1440x900-archive-inspect.jpg'), type: 'jpeg', quality: 84 })
  await desktop.locator('canvas').click({ position: { x: 1080, y: 470 } })
  assert(await desktop.locator('body').evaluate((body) => body.classList.contains('project-open')), 'Desktop Archive grave did not open a project')
  assert(await desktop.locator('#projectTitle').textContent() === 'More Than Wombat', 'Desktop Archive hover/click did not target the fourth grave')
  await desktop.locator('#projectClose').click()
  await desktop.locator('#inspectBack').click()
  assert(await desktop.locator('body').evaluate((body) => !body.classList.contains('inspect-selector')), 'Desktop Archive inspect view did not return to the lounge')
  await desktop.close()

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await mobile.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 8 })
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 })
    const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
    window.__qaAnimationFrames = 0
    window.requestAnimationFrame = (callback) => nativeRequestAnimationFrame((time) => {
      window.__qaAnimationFrames += 1
      callback(time)
    })
  })
  const runtimeProblems = []
  mobile.on('console', (message) => {
    if ((message.type() === 'warning' || message.type() === 'error') && !isBenignRendererWarning(message)) runtimeProblems.push(`${message.type()}: ${message.text()}`)
  })
  mobile.on('pageerror', (error) => runtimeProblems.push(`pageerror: ${error.message}`))
  await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await mobile.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  assert(await mobile.locator('body').evaluate((body) => body.classList.contains('mobile-ui')), 'Mobile UI class is missing')
  assert(await mobile.locator('canvas').getAttribute('data-quality') === 'mobile-standard', 'Standard mobile render profile is incorrect')
  assert(await mobile.locator('canvas').getAttribute('data-scene-detail') === '96', 'Standard mobile scene detail budget is incorrect')
  assert(await mobile.locator('#mobileSheet').evaluate((element) => element.inert), 'Studio sheet must be inert')
  await mobile.waitForTimeout(500)
  const startFrames = await mobile.evaluate(() => window.__qaAnimationFrames)
  await mobile.waitForTimeout(1000)
  const idleFrames = (await mobile.evaluate(() => window.__qaAnimationFrames)) - startFrames
  assert(idleFrames <= 14, `Demand-driven rendering exceeded its idle budget: ${idleFrames} frames/sec`)

  await mobile.locator('.nav button[data-view="games"]').click()
  await mobile.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('canvas')?.dataset.gamesProof ?? ''))
  assert(await mobile.locator('canvas').getAttribute('data-hero-models') === 'procedural-fallback', 'Mobile loaded Desktop-only hero models')
  const mobileResolution = await readScreenResolutions(mobile)
  assert(hasScale(mobileResolution, ['games', 'gamepan', 'terminal', 'apps', 'appticker', 'archive'], 1), 'Mobile live-screen resolution policy changed')
  assert(mobileResolution.projects?.scale === 1, 'Mobile project-card resolution policy changed')
  const metrics = await mobile.evaluate(() => ({
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    navButtonHeights: [...document.querySelectorAll('.nav button')].map((element) => element.getBoundingClientRect().height),
    sheetVisible: getComputedStyle(document.querySelector('#mobileSheet')).display !== 'none',
    sheetExpanded: document.querySelector('#mobileSheetToggle')?.getAttribute('aria-expanded'),
    desktopInfoVisible: getComputedStyle(document.querySelector('.info')).display !== 'none',
  }))
  assert(metrics.overflow === 0, `Mobile has ${metrics.overflow}px horizontal overflow`)
  assert(metrics.navButtonHeights.every((height) => height >= 44), 'Mobile navigation contains a touch target below 44px')
  assert(metrics.sheetVisible, 'Context sheet is not visible in Games')
  assert(metrics.sheetExpanded === 'false', 'Context sheet should start collapsed')
  assert(!metrics.desktopInfoVisible, 'Desktop information card is visible on Mobile')

  await mobile.locator('#mobileSheetToggle').click()
  assert(await mobile.locator('body').evaluate((body) => body.classList.contains('mobile-sheet-expanded')), 'Sheet did not expand')
  assert(!(await mobile.locator('#mobileSheetPanel').evaluate((element) => element.inert)), 'Expanded sheet remained inert')
  assert(await mobile.locator('.mobile-project-card').count() === 4, 'Games carousel does not contain four projects')
  await mobile.locator('.mobile-project-card[data-project="core_arena"]').click()
  assert(await mobile.locator('.mobile-project-card[data-project="core_arena"]').getAttribute('aria-selected') === 'true', 'Game selection did not update')
  await mobile.screenshot({ path: path.join(outputDirectory, 'mobile-390x844-games-expanded.jpg'), type: 'jpeg', quality: 84 })
  await mobile.locator('#mobileOpenProject').click()
  assert(await mobile.locator('#projectTitle').textContent() === 'Core Arena', 'Open project did not use the selected game')
  await mobile.screenshot({ path: path.join(outputDirectory, 'mobile-390x844-project-modal.jpg'), type: 'jpeg', quality: 84 })
  await mobile.keyboard.press('Escape')
  assert(!(await mobile.locator('body').evaluate((body) => body.classList.contains('project-open'))), 'Escape did not close project details')
  await mobile.keyboard.press('Escape')
  assert(await mobile.locator('#mobileSheetToggle').getAttribute('aria-expanded') === 'false', 'Escape did not collapse the sheet')
  await mobile.locator('#mobileSheetToggle').click()
  await mobile.locator('#mobileGameInspect').click()
  assert(await mobile.locator('body').evaluate((body) => body.classList.contains('inspect-selector')), 'Games room selector did not open')
  await mobile.keyboard.press('Escape')
  assert(!(await mobile.locator('body').evaluate((body) => body.classList.contains('inspect-selector'))), 'Escape did not leave the Games room selector')
  await mobile.keyboard.press('Escape')
  assert(await mobile.locator('#mobileSheetToggle').getAttribute('aria-expanded') === 'false', 'Games sheet did not collapse after leaving the room selector')
  await mobile.locator('#mobileSheetToggle').click()
  await mobile.locator('canvas').click({ position: { x: 380, y: 90 } })
  assert(await mobile.locator('#mobileSheetToggle').getAttribute('aria-expanded') === 'false', 'Tapping free 3D space did not collapse the sheet')

  for (const [view, project] of [['web', 'zerohero'], ['projects', 'pocket_pier'], ['archive', 'cloudtop_run']]) {
    await mobile.locator(`.nav button[data-view="${view}"]`).click()
    await mobile.locator('#mobileSheetToggle').click()
    assert(await mobile.locator('.mobile-project-card').count() === 4, `${view} carousel does not contain four projects`)
    await mobile.locator(`.mobile-project-card[data-project="${project}"]`).click()
    assert(await mobile.locator(`.mobile-project-card[data-project="${project}"]`).getAttribute('aria-selected') === 'true', `${view} selection did not update`)
    await mobile.screenshot({ path: path.join(outputDirectory, `mobile-390x844-${view}-expanded.jpg`), type: 'jpeg', quality: 84 })
    await mobile.locator('#mobileOpenProject').click()
    assert((await mobile.locator('#projectTitle').textContent())?.length > 0, `${view} selected project did not open`)
    await mobile.keyboard.press('Escape')
    await mobile.keyboard.press('Escape')
  }
  assert(runtimeProblems.length === 0, `Browser console problems:\n${runtimeProblems.join('\n')}`)
  const canvas = mobile.locator('canvas')
  await canvas.evaluate((element) => element.dispatchEvent(new Event('webglcontextlost', { cancelable: true })))
  assert(await mobile.locator('#webglRecovery').isVisible(), 'WebGL recovery notice did not appear')
  await canvas.evaluate((element) => element.dispatchEvent(new Event('webglcontextrestored')))
  assert(!(await mobile.locator('#webglRecovery').isVisible()), 'WebGL recovery notice did not clear')
  await mobile.close()

  const constrainedMobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await constrainedMobile.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 4 })
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 4 })
  })
  await constrainedMobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await constrainedMobile.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  assert(await constrainedMobile.locator('canvas').getAttribute('data-quality') === 'mobile-low', 'Constrained mobile render profile is incorrect')
  assert(await constrainedMobile.locator('canvas').getAttribute('data-scene-detail') === '48', 'Constrained mobile scene detail budget is incorrect')
  await constrainedMobile.close()

  const landscape = await browser.newPage({ viewport: { width: 740, height: 430 }, reducedMotion: 'reduce' })
  await landscape.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await landscape.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  assert(await landscape.locator('body').evaluate((body) => body.classList.contains('mobile-landscape')), 'Landscape class is missing')
  for (const view of ['games', 'web', 'projects', 'archive']) {
    await landscape.locator(`.nav button[data-view="${view}"]`).click()
    await landscape.locator('#mobileSheetToggle').click()
    await landscape.waitForTimeout(50)
    const bounds = await landscape.evaluate(() => {
      const sheet = document.querySelector('#mobileSheet')?.getBoundingClientRect()
      const nav = document.querySelector('.navwrap')?.getBoundingClientRect()
      return { sheetTop: sheet?.top ?? -1, navBottom: nav?.bottom ?? Infinity, width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }
    })
    assert(bounds.sheetTop >= 0, `${view} landscape sheet is clipped at the top`)
    assert(bounds.navBottom <= 430, `${view} landscape navigation is clipped`)
    assert(bounds.width === bounds.scrollWidth, `${view} landscape has horizontal overflow`)
    await landscape.screenshot({ path: path.join(outputDirectory, `mobile-landscape-740x430-${view}-expanded.jpg`), type: 'jpeg', quality: 84 })
    await landscape.keyboard.press('Escape')
  }
  await landscape.setViewportSize({ width: 390, height: 844 })
  await landscape.waitForTimeout(50)
  assert(!(await landscape.locator('body').evaluate((body) => body.classList.contains('mobile-landscape'))), 'Orientation change did not clear landscape class')
  await landscape.close()

  const matrix = [
    { width: 360, height: 800, mobile: true },
    { width: 412, height: 915, mobile: true },
    { width: 430, height: 932, mobile: true },
    { width: 768, height: 1024, mobile: false },
    { width: 1366, height: 768, mobile: false },
    { width: 1920, height: 1080, mobile: false },
  ]
  for (const profile of matrix) {
    const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height }, reducedMotion: 'reduce' })
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
    for (const view of ['games', 'web', 'projects', 'archive']) {
      await page.locator(`.nav button[data-view="${view}"]`).click()
      const layout = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        mobile: document.body.classList.contains('mobile-ui'),
        nav: document.querySelector('.navwrap')?.getBoundingClientRect().toJSON(),
        sheetDisplay: getComputedStyle(document.querySelector('#mobileSheet')).display,
        infoDisplay: getComputedStyle(document.querySelector('.info')).display,
      }))
      assert(layout.clientWidth === layout.scrollWidth, `${profile.width}x${profile.height} ${view} has horizontal overflow`)
      assert(layout.mobile === profile.mobile, `${profile.width}x${profile.height} used the wrong responsive mode`)
      assert((layout.nav?.bottom ?? Infinity) <= profile.height, `${profile.width}x${profile.height} navigation is clipped`)
      if (profile.mobile) {
        assert(layout.sheetDisplay !== 'none' && layout.infoDisplay === 'none', `${profile.width}x${profile.height} did not isolate mobile UI`)
        await page.locator('#mobileSheetToggle').click()
        const sheet = await page.locator('#mobileSheet').boundingBox()
        assert(Boolean(sheet) && sheet.y >= 0 && sheet.y + sheet.height <= profile.height, `${profile.width}x${profile.height} ${view} sheet is clipped`)
        await page.keyboard.press('Escape')
      } else assert(layout.sheetDisplay === 'none' && layout.infoDisplay !== 'none', `${profile.width}x${profile.height} changed Desktop UI`)
    }
    await page.close()
  }

  const failedImagePage = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  await failedImagePage.route('**/territory-tide.webp', (route) => route.abort())
  await failedImagePage.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await failedImagePage.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  await failedImagePage.locator('.nav button[data-view="games"]').click()
  await failedImagePage.locator('#mobileSheetToggle').click()
  await failedImagePage.locator('#mobileOpenProject').click()
  await failedImagePage.waitForFunction(() => document.querySelector('#projectImage')?.hidden)
  assert(await failedImagePage.locator('.project-media').getAttribute('data-fallback') === 'Territory Tide', 'Failed project image did not show its fallback')
  await failedImagePage.close()
} finally {
  await browser?.close()
  await server.close()
}

console.log('Mobile UI QA passed')
