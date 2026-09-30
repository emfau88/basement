import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const assert = (condition, message) => { if (!condition) throw new Error(message) }
const outputDirectory = path.resolve('docs/qa/current/studio-discovery')
await mkdir(outputDirectory, { recursive: true })
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const address = server.httpServer.address()
const baseUrl = `http://127.0.0.1:${address.port}/`
const yaw = async (page) => Number(await page.locator('canvas').getAttribute('data-studio-yaw'))
const waitForCamera = (page) => page.waitForFunction(() => !document.body.classList.contains('camera-moving'))
let browser
try {
  browser = await chromium.launch({ channel: 'msedge', headless: true })
  for (const profile of [
    { name: 'desktop', width: 1440, height: 900, touch: false, limit: 16 },
    { name: 'desktop-compact', width: 900, height: 600, touch: false, limit: 16 },
    { name: 'portrait', width: 390, height: 844, touch: true, limit: 32 },
    { name: 'landscape', width: 740, height: 430, touch: true, limit: 22 },
    { name: 'wide-touch', width: 1024, height: 600, touch: true, limit: 16 },
  ]) {
    const page = await browser.newPage({ viewport: { width: profile.width, height: profile.height }, hasTouch: profile.touch, isMobile: profile.touch, reducedMotion: 'reduce' })
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('#loader')?.classList.contains('done'), undefined, { timeout: 120_000 })
    await page.waitForFunction(() => getComputedStyle(document.querySelector('#loader')).opacity === '0')
    const session = profile.touch ? await page.context().newCDPSession(page) : null
    const drag = async (from, to) => {
      if (session) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from[0], y: from[1] }] })
        for (let index = 1; index <= 12; index++) {
          await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from[0] + (to[0] - from[0]) * index / 12, y: from[1] + (to[1] - from[1]) * index / 12 }] })
        }
        await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      } else {
        await page.mouse.move(...from); await page.mouse.down()
        await page.mouse.move(...to, { steps: 12 }); await page.mouse.up()
      }
    }
    const start = [profile.width * .8, profile.height * .52]
    const end = [profile.width * .1, profile.height * .52]
    const markers = page.locator('.studio-marker:visible')
    assert(await markers.count() === (profile.touch ? 0 : 4), `${profile.name}: unexpected marker visibility`)
    assert(await page.locator('canvas').getAttribute('data-studio-highlight-targets') === '7', `${profile.name}: authored highlight targets are missing`)
    assert(await page.locator('canvas').getAttribute('data-studio-hover') === '', `${profile.name}: highlight started active`)
    if (!profile.touch) {
      const iconStates = await markers.evaluateAll((buttons) => buttons.map((button) => ({
        direction: button.dataset.direction,
        edge: button.dataset.edge,
        svgCount: button.querySelectorAll('.studio-marker-arrow svg').length,
        iconHidden: button.querySelector('.studio-marker-arrow')?.getAttribute('aria-hidden'),
        iconFocusable: button.querySelector('svg')?.getAttribute('focusable'),
        background: getComputedStyle(button).backgroundColor,
        textShadow: getComputedStyle(button.querySelector('.studio-marker-arrow')).textShadow,
        transition: getComputedStyle(button).transitionDuration,
      })))
      for (const icon of iconStates) {
        assert(icon.svgCount === 1 && icon.iconHidden === 'true' && icon.iconFocusable === 'false', `${profile.name}: marker icon is missing or entered the accessibility tree`)
        assert(icon.edge === 'true' ? ['left', 'right'].includes(icon.direction) : icon.direction === 'down', `${profile.name}: marker lost its edge direction`)
        assert(icon.background === 'rgb(238, 234, 225)' && icon.textShadow === 'none', `${profile.name}: matte marker styling regressed`)
        assert(icon.transition === '0s', `${profile.name}: reduced-motion marker still animates`)
      }
      const gamesMarker = page.locator('.studio-marker[data-view="games"]')
      const restingBounds = await gamesMarker.boundingBox()
      await gamesMarker.hover()
      assert(await page.locator('canvas').getAttribute('data-studio-hover') === 'games', `${profile.name}: pill hover did not select the Games frame`)
      assert(await page.locator('.studio-marker.is-active').count() === 1, `${profile.name}: more than one pill was highlighted`)
      await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-marker-hover.png`) })
      const hoveredBounds = await gamesMarker.boundingBox()
      assert(JSON.stringify(restingBounds) === JSON.stringify(hoveredBounds), `${profile.name}: marker moved on hover`)
      assert(await page.locator('body').evaluate((body) => body.classList.contains('view-studio')), `${profile.name}: marker hover navigated the camera`)
      await page.mouse.move(profile.width * .5, profile.height * .45)
      assert(await page.locator('canvas').getAttribute('data-studio-hover') === 'games', `${profile.name}: physical Games screen did not share pill hover`)
      await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-scene-hover.png`) })
      await page.mouse.move(5, profile.height - 5)
      assert(await page.locator('canvas').getAttribute('data-studio-hover') === '', `${profile.name}: scene hover was not cleared`)
      await gamesMarker.focus()
      assert(await page.locator('canvas').getAttribute('data-studio-hover') === 'games', `${profile.name}: keyboard focus did not highlight the same area`)
      const focusOutline = await gamesMarker.evaluate((button) => ({ width: getComputedStyle(button).outlineWidth, style: getComputedStyle(button).outlineStyle }))
      assert(focusOutline.width === '2px' && focusOutline.style === 'solid', `${profile.name}: keyboard focus is not visible`)
      await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-marker-focus.png`) })
      await page.keyboard.press('Escape'); await waitForCamera(page)
      assert(await page.locator('canvas').getAttribute('data-studio-hover') === '', `${profile.name}: Escape retained its highlight`)
      const boxes = await markers.evaluateAll((buttons) => buttons.map((button) => {
        const { left, top, right, bottom } = button.getBoundingClientRect()
        return { left, top, right, bottom }
      }))
      for (const [index, box] of boxes.entries()) {
        assert(box.left >= 0 && box.right <= profile.width && box.top >= 0 && box.bottom < profile.height - 90, 'Desktop marker was clipped')
        for (const other of boxes.slice(index + 1)) assert(box.right <= other.left || other.right <= box.left || box.bottom <= other.top || other.bottom <= box.top, 'Desktop markers overlap')
      }
      for (const view of ['games', 'web', 'projects', 'archive']) {
        const marker = page.locator(`.studio-marker[data-view="${view}"]`)
        await marker.hover()
        assert(await page.locator('canvas').getAttribute('data-studio-hover') === view, `${profile.name}: ${view} pill highlighted the wrong area`)
        assert(await page.locator('.studio-marker.is-active').count() === 1, `${profile.name}: multiple work areas highlighted`)
        await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-${view}-highlight.png`) })
        if (view === 'archive') { await marker.focus(); await page.keyboard.press('Enter') }
        else await marker.click()
        await waitForCamera(page)
        assert(await page.locator('body').evaluate((body, view) => body.classList.contains(`view-${view}`), view), `Desktop ${view} marker opened the wrong area`)
        assert(await page.locator('.studio-marker:visible').count() === 0, 'Markers remained visible in focus view')
        assert(await page.locator('canvas').getAttribute('data-studio-hover') === '', `${profile.name}: highlight survived navigation`)
        await page.locator('.nav button[data-view="studio"]').click(); await waitForCamera(page)
      }
    }
    await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-center.png`) })
    await drag(start, end)
    assert(await page.locator('canvas').getAttribute('data-studio-hover') === '', `${profile.name}: drag retained a highlight`)
    assert(await page.locator('body').evaluate((body) => body.classList.contains('view-studio')), `${profile.name}: drag accidentally opened a room`)
    assert(Math.abs(await yaw(page) + profile.limit * Math.PI / 180) < .001, `${profile.name}: rightward look was not clamped`)
    assert(!(await page.locator('canvas').evaluate((canvas) => canvas.classList.contains('studio-dragging'))), `${profile.name}: drag state stuck after release`)
    await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-right.png`) })
    await drag(start, end)
    assert(Math.abs(await yaw(page) + profile.limit * Math.PI / 180) < .001, `${profile.name}: repeated drag exceeded limit`)
    await page.locator('.nav button[data-view="studio"]').click()
    await waitForCamera(page)
    assert(await yaw(page) === 0, `${profile.name}: Studio button did not recenter`)
    await drag(end, start)
    assert(Math.abs(await yaw(page) - profile.limit * Math.PI / 180) < .001, `${profile.name}: leftward look was not clamped`)
    await page.screenshot({ path: path.join(outputDirectory, `${profile.name}-left.png`) })
    await page.keyboard.press('Escape'); await waitForCamera(page)
    assert(await yaw(page) === 0, `${profile.name}: Escape did not recenter`)
    if (profile.touch) await page.touchscreen.tap(profile.width / 2, profile.height * .48)
    else await page.mouse.click(profile.width / 2, profile.height * .48)
    await waitForCamera(page)
    assert(await page.locator('body').evaluate((body) => body.classList.contains('view-games')), `${profile.name}: room tap stopped working`)
    await drag(start, end)
    assert(await yaw(page) === 0, `${profile.name}: focus camera changed on drag`)
    if (await page.locator('body').evaluate((body) => body.classList.contains('project-open'))) await page.keyboard.press('Escape')
    await page.locator('.nav button[data-view="studio"]').click(); await waitForCamera(page)
    if (session) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: start[0], y: start[1] }] })
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: start[0] - 60, y: start[1] }] })
      await session.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] })
    } else {
      await page.mouse.move(...start); await page.mouse.down(); await page.mouse.move(start[0] - 60, start[1])
      await page.keyboard.press('Escape'); await page.mouse.up()
    }
    assert(!(await page.locator('canvas').evaluate((canvas) => canvas.classList.contains('studio-dragging'))), `${profile.name}: canceled gesture retained capture state`)
    await page.setViewportSize({ width: profile.height, height: profile.width })
    await page.waitForTimeout(100)
    assert(await yaw(page) === 0, `${profile.name}: resize did not restore approved composition`)
    assert(errors.length === 0, `${profile.name}: ${errors.join('\n')}`)
    await page.close()
  }
} finally {
  await browser?.close()
  await server.close()
}
console.log('Studio discovery QA passed (markers, mouse, real touch, bounds, taps, recenter, cancel and rotation)')
