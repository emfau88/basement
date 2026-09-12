import { chromium } from '@playwright/test'
import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { startStaticBuildServer } from './lib/static-build-server.mjs'

const profiles = [
  { name: 'desktop', width: 1440, height: 900, memory: 8, cores: 8, expectedDetail: '160' },
  { name: 'mobile-standard', width: 390, height: 844, memory: 8, cores: 8, expectedDetail: '96' },
  { name: 'mobile-low', width: 390, height: 844, memory: 4, cores: 4, expectedDetail: '48' },
]

const server = await startStaticBuildServer({ prefix: '/basement/' })
const localOrigin = new URL(server.url).origin
const browser = await chromium.launch({ channel: 'msedge', headless: true })
const results = []

try {
  for (const profile of profiles) {
    const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height }, deviceScaleFactor: 2, reducedMotion: 'reduce' })
    await page.route('**/*', (route) => new URL(route.request().url()).origin === localOrigin ? route.continue() : route.abort())
    await page.addInitScript(({ memory, cores }) => {
      Object.defineProperty(navigator, 'deviceMemory', { configurable: true, value: memory })
      Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, value: cores })
      const nativeRequestAnimationFrame = window.requestAnimationFrame.bind(window)
      window.__benchmarkFrames = 0
      window.requestAnimationFrame = (callback) => nativeRequestAnimationFrame((time) => {
        window.__benchmarkFrames += 1
        callback(time)
      })
    }, { memory: profile.memory, cores: profile.cores })

    const started = performance.now()
    await page.goto(server.url, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'))
    const readyMs = Math.round(performance.now() - started)
    await page.locator('.nav button[data-view="games"]').click()
    await page.waitForTimeout(1250)
    const startFrames = await page.evaluate(() => window.__benchmarkFrames)
    await page.waitForTimeout(1000)
    const idleFrames = (await page.evaluate(() => window.__benchmarkFrames)) - startFrames
    const metrics = await page.evaluate(() => {
      const canvas = document.querySelector('canvas')
      return {
        backbufferPixels: (canvas?.width ?? 0) * (canvas?.height ?? 0),
        quality: canvas?.dataset.quality,
        sceneDetail: canvas?.dataset.sceneDetail,
      }
    })
    if (metrics.quality !== profile.name || metrics.sceneDetail !== profile.expectedDetail) {
      throw new Error(`${profile.name} selected an unexpected runtime budget: ${JSON.stringify(metrics)}`)
    }
    if (idleFrames > 14) throw new Error(`${profile.name} exceeded the idle frame budget: ${idleFrames}`)
    results.push({ profile: profile.name, viewport: `${profile.width}x${profile.height}`, readyMs, idleFrames, ...metrics })
    await page.close()
  }
} finally {
  await browser.close()
  await server.close()
}

const assetsDirectory = path.resolve('dist/assets')
const assetEntries = await readdir(assetsDirectory, { withFileTypes: true })
const bundleFiles = await Promise.all(assetEntries.filter((entry) => entry.isFile()).map(async (entry) => {
  const target = path.join(assetsDirectory, entry.name)
  return { file: entry.name, bytes: (await stat(target)).size, gzipBytes: gzipSync(await readFile(target)).length }
}))
const projectMediaFiles = await readdir(path.join(assetsDirectory, 'projects'))
const projectMediaBytes = (await Promise.all(projectMediaFiles.map(async (file) =>
  (await stat(path.join(assetsDirectory, 'projects', file))).size
))).reduce((total, bytes) => total + bytes, 0)

console.log(JSON.stringify({ bundleFiles, projectMedia: { files: projectMediaFiles.length, bytes: projectMediaBytes }, profiles: results }, null, 2))
