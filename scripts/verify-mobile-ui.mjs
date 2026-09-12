import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the QA server port')
const baseUrl = `http://127.0.0.1:${address.port}/`

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await desktop.goto(baseUrl, { waitUntil: 'networkidle' })
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
  await mobile.goto(baseUrl, { waitUntil: 'networkidle' })
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
  await mobile.keyboard.press('Escape')
  assert(await mobile.locator('#mobileSheetToggle').getAttribute('aria-expanded') === 'false', 'Escape did not collapse the sheet')
  await mobile.locator('#mobileSheetToggle').click()
  await mobile.locator('canvas').click({ position: { x: 4, y: 500 } })
  assert(await mobile.locator('#mobileSheetToggle').getAttribute('aria-expanded') === 'false', 'Tapping free 3D space did not collapse the sheet')
  assert(runtimeProblems.length === 0, `Browser console problems:\n${runtimeProblems.join('\n')}`)
  await mobile.close()
} finally {
  await browser?.close()
  await server.close()
}

console.log('Mobile UI QA passed')
