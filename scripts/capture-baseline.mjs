import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'

const baselineMode = process.argv.includes('--baseline')
const outputDirectory = path.resolve(baselineMode ? 'docs/qa/baseline' : 'docs/qa/current')
const force = process.argv.includes('--force')
const viewNames = ['studio', 'games', 'web', 'projects', 'archive']
const profiles = [
  { name: 'desktop-1440x900', width: 1440, height: 900 },
  { name: 'mobile-390x844', width: 390, height: 844 },
  { name: 'mobile-430x932', width: 430, height: 932 },
]
const isBenignRendererWarning = (message) => message.text().startsWith('THREE.WebGLProgram: Program Info Log:') && message.text().includes('warning X4122')

await mkdir(outputDirectory, { recursive: true })
if (baselineMode && !force && (await readdir(outputDirectory)).some((name) => name.endsWith('.jpg'))) {
  throw new Error('Baseline images already exist. Pass --force only after an intentional baseline approval.')
}

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the baseline server port')
const baselineUrl = `http://127.0.0.1:${address.port}/`

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    })
    const page = await context.newPage()
    const runtimeProblems = []
    page.on('console', (message) => {
      if (message.type() === 'warning' || message.type() === 'error') {
        if (message.type() === 'warning' && isBenignRendererWarning(message)) return
        const location = message.location().url
        runtimeProblems.push(`${message.type()}: ${message.text()}${location ? ` @ ${location}` : ''}`)
      }
    })
    page.on('pageerror', (error) => runtimeProblems.push(`pageerror: ${error.message}`))
    await page.goto(baselineUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
    await page.waitForTimeout(1200)

    for (const view of viewNames) {
      if (view !== 'studio') {
        await page.locator(`.nav button[data-view="${view}"]`).click()
        if (view === 'games') {
          await page.waitForFunction(() => ['ready', 'fallback'].includes(document.querySelector('canvas')?.dataset.gamesProof ?? ''))
        }
        await page.waitForTimeout(350)
      }
      await page.screenshot({
        path: path.join(outputDirectory, `${profile.name}-${view}.jpg`),
        type: 'jpeg',
        quality: 84,
        fullPage: false,
      })
    }
    if (runtimeProblems.length > 0) {
      throw new Error(`${profile.name} produced browser console problems:\n${runtimeProblems.join('\n')}`)
    }
    await context.close()
  }
} finally {
  await browser?.close()
  await server.close()
}

console.log(`Captured ${profiles.length * viewNames.length} ${baselineMode ? 'baseline' : 'current'} images in ${outputDirectory}`)
