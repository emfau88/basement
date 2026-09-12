export interface RenderScheduler {
  requestRender(): void
  startTransition(): void
  destroy(): void
}

export function createRenderScheduler(options: {
  render(): void
  updateCamera(now: number): boolean
  updateScreens(now: number): boolean
}): RenderScheduler {
  let frameId = 0
  let transitioning = false

  const frame = (now: number) => {
    frameId = 0
    const stillMoving = transitioning && options.updateCamera(now)
    options.render()
    transitioning = stillMoving
    if (stillMoving) frameId = requestAnimationFrame(frame)
  }
  const requestRender = () => { if (!frameId && document.visibilityState !== 'hidden') frameId = requestAnimationFrame(frame) }
  const screenTimer = window.setInterval(() => {
    if (document.visibilityState === 'hidden') return
    if (options.updateScreens(performance.now())) requestRender()
  }, 90)
  const onVisibility = () => { if (document.visibilityState === 'visible') requestRender() }
  document.addEventListener('visibilitychange', onVisibility, { passive: true })

  return {
    requestRender,
    startTransition: () => { transitioning = true; requestRender() },
    destroy: () => { cancelAnimationFrame(frameId); clearInterval(screenTimer); document.removeEventListener('visibilitychange', onVisibility) },
  }
}
