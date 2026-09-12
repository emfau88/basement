import { chromium } from '@playwright/test'
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve('dist')
const prefix = '/basement/'
const mimeTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml' }

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname)
    if (!pathname.startsWith(prefix)) { response.writeHead(404).end('Not found'); return }
    const relative = pathname.slice(prefix.length) || 'index.html'
    const target = path.resolve(root, relative)
    if (!target.startsWith(`${root}${path.sep}`) || !(await stat(target)).isFile()) { response.writeHead(404).end('Not found'); return }
    const extension = path.extname(target)
    response.writeHead(200, { 'Content-Type': mimeTypes[extension] ?? 'application/octet-stream' })
    response.end(await readFile(target))
  } catch {
    response.writeHead(404).end('Not found')
  }
})
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const address = server.address()
if (!address || typeof address === 'string') throw new Error('Unable to resolve Pages QA server port')

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' })
  const problems = []
  page.on('console', (message) => {
    if (message.type() === 'warning' || message.type() === 'error') problems.push(`${message.type()}: ${message.text()}`)
  })
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`))
  await page.goto(`http://127.0.0.1:${address.port}${prefix}`, { waitUntil: 'domcontentloaded' })
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
  if (problems.length > 0) throw new Error(`Pages build console problems:\n${problems.join('\n')}`)
  await page.close()
} finally {
  await browser?.close()
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}

console.log('GitHub Pages subpath QA passed')
