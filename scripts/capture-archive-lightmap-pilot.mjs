import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const outputDirectory = path.resolve('docs/qa/bulk-23-5-archive-lightmap')
await mkdir(outputDirectory, { recursive: true })

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the lightmap QA server port')
const baseUrl = `http://127.0.0.1:${address.port}/`

const measurements = []
let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const variant of [
    { name: 'before', query: '', expected: 'off' },
    { name: 'after', query: '?archive-lightmap=pilot', expected: 'pilot' },
  ]) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const runtimeProblems = []
    page.on('pageerror', (error) => runtimeProblems.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') runtimeProblems.push(`error: ${message.text()}`)
    })

    await page.goto(`${baseUrl}${variant.query}`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
    await page.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('canvas')?.dataset.gamesProof ?? ''))
    await page.locator('.nav button[data-view="archive"]').click()
    await page.waitForTimeout(900)
    const runtimeState = await page.locator('canvas').getAttribute('data-archive-lightmap')
    if (runtimeState !== variant.expected) throw new Error(`${variant.name} expected ${variant.expected}, received ${runtimeState}`)
    await page.screenshot({
      path: path.join(outputDirectory, `${variant.name}-desktop-1440x900.jpg`),
      type: 'jpeg',
      quality: 90,
      timeout: 60000,
    })
    const resources = await page.evaluate(() => performance.getEntriesByType('resource').length)
    const estimatedGpuBytes = Number(await page.locator('canvas').getAttribute('data-archive-lightmap-bytes') ?? 0)
    measurements.push({ variant: variant.name, resources, runtimeState, estimatedGpuBytes })
    if (runtimeProblems.length > 0) throw new Error(`${variant.name} produced browser errors:\n${runtimeProblems.join('\n')}`)
    await context.close()
  }
} finally {
  await browser?.close()
  await server.close()
}

await writeFile(path.join(outputDirectory, 'measurements.json'), `${JSON.stringify(measurements, null, 2)}\n`)
console.log(`Captured Archive lightmap A/B comparison in ${outputDirectory}`)
