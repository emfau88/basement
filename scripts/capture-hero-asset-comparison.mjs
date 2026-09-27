import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const label = process.argv[2]
if (!label || !/^[a-z0-9-]+$/.test(label)) {
  throw new Error('Pass a lowercase comparison label, for example: before-input')
}

const outputDirectory = path.resolve('docs/qa/bulk-24-7-hero-assets')
await mkdir(outputDirectory, { recursive: true })

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the QA server port')

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: 'reduce',
  })
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(
    () => document.querySelector('#loader')?.classList.contains('done'),
    undefined,
    { timeout: 120_000 },
  )
  await page.locator('.nav button[data-view="games"]').click()
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.gamesProof === 'ready')
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(outputDirectory, `${label}-games.jpg`),
    type: 'jpeg',
    quality: 88,
  })
  await page.screenshot({
    path: path.join(outputDirectory, `${label}-input-detail.png`),
    type: 'png',
    clip: { x: 260, y: 410, width: 690, height: 235 },
  })
  await page.screenshot({
    path: path.join(outputDirectory, `${label}-plant-detail.png`),
    type: 'png',
    clip: { x: 0, y: 315, width: 390, height: 410 },
  })
} finally {
  await browser?.close()
  await server.close()
}

console.log(`Captured ${label} hero-asset references in ${outputDirectory}`)
