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
  assert(await desktop.locator('.info').evaluate((element) => getComputedStyle(element).display !== 'none'), 'Desktop information card disappeared')
  assert(await desktop.locator('#mobileSheet').evaluate((element) => getComputedStyle(element).display === 'none'), 'Desktop rendered the mobile sheet')
  await desktop.close()

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const runtimeProblems = []
  mobile.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') runtimeProblems.push(`${message.type()}: ${message.text()}`)
  })
  mobile.on('pageerror', (error) => runtimeProblems.push(`pageerror: ${error.message}`))
  await mobile.goto(baseUrl, { waitUntil: 'domcontentloaded' })
  await mobile.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  assert(await mobile.locator('body').evaluate((body) => body.classList.contains('mobile-ui')), 'Mobile UI class is missing')
  assert(await mobile.locator('#mobileSheet').evaluate((element) => element.inert), 'Studio sheet must be inert')

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
  await mobile.keyboard.press('Escape')
  assert(!(await mobile.locator('body').evaluate((body) => body.classList.contains('project-open'))), 'Escape did not close project details')
  await mobile.keyboard.press('Escape')
  assert(await mobile.locator('#mobileSheetToggle').getAttribute('aria-expanded') === 'false', 'Escape did not collapse the sheet')
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
  await mobile.close()

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
} finally {
  await browser?.close()
  await server.close()
}

console.log('Mobile UI QA passed')
