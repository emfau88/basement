import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const output = path.resolve('docs/qa/bulk-24-2-mobile-asset-parity')
await mkdir(output, { recursive: true })
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve QA server port')

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 8 })
    Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 })
  })
  await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
  await page.waitForFunction(() => document.querySelector('canvas')?.dataset.heroModels === 'desktop-ready')
  await page.screenshot({ path: path.join(output, 'standard-studio.jpg'), type: 'jpeg', quality: 88 })
  for (const view of ['games', 'archive']) {
    await page.locator(`.nav button[data-view="${view}"]`).click({ force: true })
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(output, `standard-${view}.jpg`), type: 'jpeg', quality: 88 })
  }
  await page.close()
} finally {
  await browser?.close()
  await server.close()
}

console.log(`Captured Mobile asset parity in ${output}`)
