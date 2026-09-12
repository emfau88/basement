import { chromium } from '@playwright/test'
import { startStaticBuildServer } from './lib/static-build-server.mjs'

const prefix = '/basement/'
const server = await startStaticBuildServer({ prefix })

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') problems.push(`${message.type()}: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  await page.goto(server.url, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  const result = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    scriptSources: [...document.scripts].map((script) => script.src).filter(Boolean),
    styleSources: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.href),
  }))
  if (result.canvasCount !== 1) throw new Error(`Expected one production canvas, found ${result.canvasCount}`)
  if (![...result.scriptSources, ...result.styleSources].every((url) => new URL(url).pathname.startsWith('/basement/'))) {
    throw new Error(`An asset escaped the Pages subpath: ${JSON.stringify(result)}`)
  }
  await page.locator('.nav button[data-view="games"]').click()
  await page.locator('#mobileSheetToggle').click()
  await page.waitForFunction(() => [...document.querySelectorAll('.mobile-project-card img')].every((image) => image.complete && image.naturalWidth > 0))
  const projectImages = await page.locator('.mobile-project-card img').evaluateAll((images) => images.map((image) => ({
    path: new URL(image.src).pathname,
    width: image.naturalWidth,
  })))
  if (!projectImages.every((image) => image.path.startsWith('/basement/assets/projects/') && image.width > 0)) {
    throw new Error(`A project image escaped the Pages build or failed to load: ${JSON.stringify(projectImages)}`)
  }
  if (problems.length > 0) throw new Error(`Pages build console problems:\n${problems.join('\n')}`)
  await page.close()
} finally {
  await browser?.close()
  await server.close()
}

console.log('GitHub Pages subpath QA passed')
