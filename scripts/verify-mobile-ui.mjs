import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}
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
  assert(await desktop.locator('body').evaluate((body) => !body.classList.contains('mobile-ui')), 'Desktop activated mobile UI')
  assert(await desktop.locator('canvas').getAttribute('data-quality') === 'desktop', 'Desktop render profile is incorrect')
  assert(await desktop.locator('canvas').getAttribute('data-scene-detail') === '160', 'Desktop scene detail budget is incorrect')
  assert(await desktop.locator('.info').evaluate((element) => getComputedStyle(element).display !== 'none'), 'Desktop information card disappeared')
  assert(await desktop.locator('#mobileSheet').evaluate((element) => getComputedStyle(element).display === 'none'), 'Desktop rendered the mobile sheet')
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
    if (message.type() === 'warning' || message.type() === 'error') runtimeProblems.push(`${message.type()}: ${message.text()}`)
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
  await failedImagePage.route('**/gameplay-desktop.png', (route) => route.abort())
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
