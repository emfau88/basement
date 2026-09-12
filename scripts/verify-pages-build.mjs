import { chromium } from '@playwright/test'
import { readdir } from 'node:fs/promises'
import { startStaticBuildServer } from './lib/static-build-server.mjs'

const prefix = '/basement/'
const server = await startStaticBuildServer({ prefix })
const buildAssets = await readdir('dist/assets')
const basisRuntime = buildAssets.filter((name) => /^basis_transcoder-.+\.(js|wasm)$/.test(name))
if (basisRuntime.length !== 2) throw new Error(`Expected bundled Basis JS/WASM runtime, found: ${JSON.stringify(basisRuntime)}`)

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') problems.push(`${message.type()}: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  await page.goto(`${server.url}?assetSmoke=ok`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.assetSmoke === 'asset')
  const result = await page.evaluate(() => ({
    canvasCount: document.querySelectorAll('canvas').length,
    scriptSources: [...document.scripts].map((script) => script.src).filter(Boolean),
    styleSources: [...document.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.href),
  }))
  if (result.canvasCount !== 1) throw new Error(`Expected one production canvas, found ${result.canvasCount}`)
  if (![...result.scriptSources, ...result.styleSources].every((url) => new URL(url).pathname.startsWith('/basement/'))) {
    throw new Error(`An asset escaped the Pages subpath: ${JSON.stringify(result)}`)
  }
  const assetRuntime = await page.evaluate(async () => Promise.all([
    'assets/runtime/fixtures/smoke-box.glb',
  ].map(async (path) => {
    const response = await fetch(path)
    return { ok: response.ok, path: new URL(response.url).pathname, bytes: (await response.arrayBuffer()).byteLength }
  })))
  if (!assetRuntime.every((asset) => asset.ok && asset.bytes > 100 && asset.path.startsWith('/basement/assets/runtime/'))) {
    throw new Error(`Asset runtime escaped the Pages subpath or failed: ${JSON.stringify(assetRuntime)}`)
  }
  const basisAssets = await page.evaluate(async (files) => Promise.all(files.map(async (file) => {
    const response = await fetch(`assets/${file}`)
    return { ok: response.ok, path: new URL(response.url).pathname, bytes: (await response.arrayBuffer()).byteLength }
  })), basisRuntime)
  if (!basisAssets.every((asset) => asset.ok && asset.bytes > 10_000 && asset.path.startsWith('/basement/assets/basis_transcoder-'))) {
    throw new Error(`Basis runtime escaped the Pages subpath or failed: ${JSON.stringify(basisAssets)}`)
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
