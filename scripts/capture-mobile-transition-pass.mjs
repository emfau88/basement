import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const output = path.resolve('docs/qa/bulk-24-3-mobile-transitions')
await mkdir(output, { recursive: true })
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve QA server port')

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const profile of [
    { name: 'portrait-390x844', width: 390, height: 844 },
    { name: 'landscape-740x430', width: 740, height: 430 },
  ]) {
    const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height }, hasTouch: true, isMobile: true })
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: 8 })
      Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: 8 })
    })
    await page.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
    await page.locator('.nav button[data-view="web"]').click({ force: true })
    await page.waitForTimeout(1300)
    await page.locator('.nav button[data-view="archive"]').click({ force: true })
    await page.waitForTimeout(450)
    await page.screenshot({ path: path.join(output, `${profile.name}-safe-waypoint.jpg`), type: 'jpeg', quality: 88 })
    await page.waitForTimeout(850)
    await page.screenshot({ path: path.join(output, `${profile.name}-archive-overview.jpg`), type: 'jpeg', quality: 88 })
    await page.locator('#mobileSheetToggle').click({ force: true })
    await page.locator('#mobileGameInspect').click({ force: true })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(output, `${profile.name}-cemetery-inspect.jpg`), type: 'jpeg', quality: 88 })
    await page.locator('#inspectBack').click({ force: true })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(output, `${profile.name}-archive-return.jpg`), type: 'jpeg', quality: 88 })
    await page.close()
  }
} finally {
  await browser?.close()
  await server.close()
}

console.log(`Captured Mobile transitions in ${output}`)
