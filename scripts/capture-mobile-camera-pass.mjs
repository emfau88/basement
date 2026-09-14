import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const labelArgument = process.argv.find((argument) => argument.startsWith('--label='))
const label = labelArgument?.slice('--label='.length)
if (!label || !['before', 'after'].includes(label)) throw new Error('Pass --label=before or --label=after')

const outputDirectory = path.resolve('docs/qa/bulk-24-1-mobile-cameras')
const profiles = [
  { name: 'portrait-390x844', width: 390, height: 844 },
  { name: 'landscape-740x430', width: 740, height: 430 },
]
const views = ['games', 'web', 'projects', 'archive']
await mkdir(outputDirectory, { recursive: true })

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the Mobile camera QA server port')
const baseUrl = `http://127.0.0.1:${address.port}/`

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      reducedMotion: 'reduce',
      hasTouch: true,
      isMobile: true,
    })
    const page = await context.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
    await page.waitForTimeout(700)
    await page.screenshot({ path: path.join(outputDirectory, `${label}-${profile.name}-studio.jpg`), type: 'jpeg', quality: 88, timeout: 60000 })

    for (const view of views) {
      await page.locator(`.nav button[data-view="${view}"]`).click({ force: true })
      if (view === 'games') await page.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('canvas')?.dataset.gamesProof ?? ''))
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(outputDirectory, `${label}-${profile.name}-${view}-collapsed.jpg`), type: 'jpeg', quality: 88, timeout: 60000 })
      await page.locator('#mobileSheetToggle').click({ force: true })
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(outputDirectory, `${label}-${profile.name}-${view}-expanded.jpg`), type: 'jpeg', quality: 88, timeout: 60000 })
      await page.keyboard.press('Escape')
    }
    if (errors.length > 0) throw new Error(`${profile.name} produced browser errors:\n${errors.join('\n')}`)
    await context.close()
  }
} finally {
  await browser?.close()
  await server.close()
}

console.log(`Captured ${label} Mobile camera set in ${outputDirectory}`)
