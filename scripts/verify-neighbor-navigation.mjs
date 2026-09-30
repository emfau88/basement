import { chromium } from '@playwright/test'
import * as THREE from 'three'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const assert = (condition, message) => { if (!condition) throw new Error(message) }
const outputDirectory = path.resolve('docs/qa/current/neighbor-navigation')
await mkdir(outputDirectory, { recursive: true })
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const baseUrl = `http://127.0.0.1:${server.httpServer.address().port}/`
const settled = (page) => page.waitForFunction(() => !document.body.classList.contains('camera-moving'))

// Physical screen anchors from gamesZone.ts / primitives.ts. Project the
// authored plane into each actual viewport rather than recycling Desktop pixels.
const leftPoint = (u = .82, v = .5) => new THREE.Vector3((u - .5) * 1.22, 1.91 + (v - .5) * .76, -.19 + .064 + .013)
  .applyAxisAngle(new THREE.Vector3(0, 1, 0), .2).add(new THREE.Vector3(-1.78, -.02, -3.31))
const mainPoint = () => new THREE.Vector3(0, 2.15, -3.46 - .27 + .064 + .013)
const pixel = (point, preset, profile) => {
  const camera = new THREE.PerspectiveCamera(preset.fov, profile.width / profile.height, .1, 90)
  camera.position.fromArray(preset.position)
  camera.lookAt(new THREE.Vector3().fromArray(preset.target))
  camera.updateMatrixWorld()
  const projected = point.project(camera)
  return { x: (projected.x + 1) * profile.width / 2, y: (1 - projected.y) * profile.height / 2 }
}

let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const profile of [
    { name: 'desktop', width: 1440, height: 900, touch: false },
    { name: 'portrait', width: 390, height: 844, touch: true },
    { name: 'docked-portrait', width: 714, height: 799, touch: false },
    { name: 'landscape', width: 740, height: 430, touch: true },
    { name: 'portrait-reduced', width: 390, height: 844, touch: true, reduced: true },
  ]) {
    const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height }, hasTouch: profile.touch, isMobile: profile.touch, reducedMotion: profile.reduced ? 'reduce' : 'no-preference' })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'), undefined, { timeout: 120_000 })
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#loader')).opacity === '0')
    const presets = await page.evaluate(async () => {
      const { getViewPreset, getInspectPreset } = await import('/src/camera/presets.ts')
      return { games: getViewPreset('games'), selector: getInspectPreset('gameSelector'), preview: getInspectPreset('gamePreview') }
    })
    const tap = async (position) => {
      assert(position.x > 0 && position.x < profile.width && position.y > 0 && position.y < profile.height, `${profile.name}: screen test anchor is outside the viewport`)
      if (profile.touch) await page.touchscreen.tap(position.x, position.y)
      else await page.mouse.click(position.x, position.y)
    }
    const nav = async (view) => { await page.locator(`.nav button[data-view="${view}"]`).click(); await settled(page) }
    await nav('web')
    for (const view of ['projects', 'web']) {
      await page.locator(`.nav button[data-view="${view}"]`).click()
      assert(await page.locator('canvas').getAttribute('data-camera-route') === 'direct', `${profile.name}: neighbor ${view} routed through Studio`)
      assert(await page.locator('canvas').getAttribute('data-camera-motion') === 'direct', `${profile.name}: neighbor ${view} used a corridor curve`)
      await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-to-${view}-moving.png`) })
      await settled(page)
      assert(await page.locator('body').evaluate((body, view) => body.classList.contains(`view-${view}`), view), `${profile.name}: neighbor move lost its destination`)
    }
    // Interrupt a neighbor move with its reverse; it must not invoke a hub.
    await page.locator('.nav button[data-view="projects"]').click()
    await page.locator('.nav button[data-view="web"]').click()
    assert(await page.locator('canvas').getAttribute('data-camera-route') === 'direct', `${profile.name}: rapid reverse used a corridor`)
    await settled(page)
    await nav('games')
    await tap(pixel(leftPoint(), presets.games, profile)); await settled(page)
    assert(await page.locator('#inspectBack').textContent() === '← GAMES OVERVIEW', `${profile.name}: left monitor did not enter selector`)
    // First row, right column = Core Arena. Actual selection must survive preview.
    await tap(pixel(leftPoint(.73, 1 - 119 / 432), presets.selector, profile))
    await page.waitForFunction(() => document.querySelector('#inspectBack')?.textContent === '← GAME SELECT')
    await settled(page)
    await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-preview.png`) })
    await tap(pixel(mainPoint(), presets.preview, profile))
    await page.waitForFunction(() => document.body.classList.contains('project-open'))
    assert(await page.locator('#projectTitle').textContent() === 'Core Arena', `${profile.name}: preview opened the wrong selection`)
    await page.locator('#projectClose').click()
    // Regression: clicking the visible left monitor must return directly to
    // selector, not clear inspection via the broad Games hotspot. On narrow
    // portrait phones the plane is outside the preview, so use GAME SELECT.
    const returnPoint = pixel(leftPoint(), presets.preview, profile)
    const leftVisible = returnPoint.x > 0 && returnPoint.x < profile.width && returnPoint.y > 0 && returnPoint.y < profile.height
    if (leftVisible && !profile.touch) {
      await page.mouse.move(returnPoint.x, returnPoint.y)
      assert(await page.locator('#tooltip').textContent() === 'Back to game select', `${profile.name}: preview selector hint is incorrect`)
    }
    if (leftVisible) await tap(returnPoint)
    else await page.locator('#inspectBack').click()
    await settled(page)
    assert(await page.locator('body').evaluate((body) => body.classList.contains('inspect-selector') && body.classList.contains('view-games')), `${profile.name}: left-monitor return zoomed out to Games overview`)
    assert(await page.locator('#inspectBack').textContent() === '← GAMES OVERVIEW', `${profile.name}: return did not land in selector`)
    await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-selector-return.png`) })
    // Select a second game immediately, without another zoom-in click.
    await tap(pixel(leftPoint(.25, 1 - 119 / 432), presets.selector, profile))
    await page.waitForFunction(() => document.querySelector('#inspectBack')?.textContent === '← GAME SELECT')
    await settled(page)
    await tap(pixel(mainPoint(), presets.preview, profile))
    await page.waitForFunction(() => document.body.classList.contains('project-open'))
    assert(await page.locator('#projectTitle').textContent() === 'Territory Tide', `${profile.name}: direct selector return did not allow a new selection`)
    await page.locator('#projectClose').click()
    await page.locator('#inspectBack').click(); await settled(page)
    assert(await page.locator('body').evaluate((body) => body.classList.contains('inspect-selector')), `${profile.name}: preview back button skipped selector`)
    await page.locator('#inspectBack').click(); await settled(page)
    assert(await page.locator('body').evaluate((body) => !body.classList.contains('inspect-selector')), `${profile.name}: selector back button failed`)
    assert(errors.length === 0, `${profile.name}: ${errors.join('\n')}`)
    await page.close()
    console.log(`${profile.name}: neighboring routes and repeated game selection passed`)
  }
} finally {
  await browser?.close()
  await server.close()
}
