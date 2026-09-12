import { chromium } from '@playwright/test'
import { createServer } from 'vite'

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer?.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve the asset QA server port')
const baseUrl = `http://127.0.0.1:${address.port}/`

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })

  const success = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  const successProblems = []
  success.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') successProblems.push(`${message.type()}: ${message.text()}`)
  })
  success.on('pageerror', (error) => successProblems.push(`pageerror: ${error.message}`))
  await success.goto(`${baseUrl}?assetSmoke=ok`, { waitUntil: 'domcontentloaded' })
  await success.waitForFunction(() => document.querySelector('canvas')?.dataset.assetSmoke === 'asset')
  const runtime = await success.evaluate(async () => {
    const paths = [
      'assets/runtime/fixtures/smoke-box.glb',
    ]
    return Promise.all(paths.map(async (path) => {
      const response = await fetch(path)
      return { path: new URL(response.url).pathname, ok: response.ok, bytes: (await response.arrayBuffer()).byteLength }
    }))
  })
  assert(runtime.every((asset) => asset.ok && asset.bytes > 100), `Runtime support asset failed: ${JSON.stringify(runtime)}`)
  assert(successProblems.length === 0, `Asset success QA console problems:\n${successProblems.join('\n')}`)
  await success.close()

  const disposal = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  await disposal.goto(`${baseUrl}?assetSmoke=dispose`, { waitUntil: 'domcontentloaded' })
  await disposal.waitForFunction(() => document.querySelector('canvas')?.dataset.assetDisposed === 'true')
  await disposal.close()

  const environmentFallback = await browser.newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  await environmentFallback.goto(`${baseUrl}?assetSmoke=environment`, { waitUntil: 'domcontentloaded' })
  await environmentFallback.waitForFunction(() => document.querySelector('canvas')?.dataset.assetSmoke === 'asset')
  await environmentFallback.waitForFunction(() => document.querySelector('canvas')?.dataset.assetEnvironment === 'fallback')
  await environmentFallback.close()

  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const fallbackProblems = []
  fallback.on('pageerror', (error) => fallbackProblems.push(`pageerror: ${error.message}`))
  await fallback.goto(`${baseUrl}?assetSmoke=missing`, { waitUntil: 'domcontentloaded' })
  await fallback.waitForFunction(() => document.querySelector('canvas')?.dataset.assetSmoke === 'fallback')
  assert(fallbackProblems.length === 0, `Asset fallback QA problems:\n${fallbackProblems.join('\n')}`)
  await fallback.close()
} finally {
  await browser?.close()
  await server.close()
}

console.log('Asset foundation QA passed')
