import { MOBILE_MEDIA_QUERY } from '../config/responsive'

export interface ViewportController {
  isMobile(): boolean
  destroy(): void
}

export function createViewportController(onChange: () => void): ViewportController {
  const mobileQuery = window.matchMedia(MOBILE_MEDIA_QUERY)
  let frameId = 0

  const applyViewportState = () => {
    frameId = 0
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    document.documentElement.style.setProperty('--app-height', `${Math.round(viewportHeight)}px`)
    document.body.classList.toggle('mobile-ui', mobileQuery.matches)
    document.body.classList.toggle('mobile-landscape', mobileQuery.matches && window.innerWidth > window.innerHeight)
    onChange()
  }
  const scheduleUpdate = () => {
    if (!frameId) frameId = window.requestAnimationFrame(applyViewportState)
  }

  mobileQuery.addEventListener('change', scheduleUpdate)
  window.addEventListener('resize', scheduleUpdate, { passive: true })
  window.addEventListener('orientationchange', scheduleUpdate, { passive: true })
  window.visualViewport?.addEventListener('resize', scheduleUpdate, { passive: true })
  applyViewportState()

  return {
    isMobile: () => mobileQuery.matches,
    destroy: () => {
      window.cancelAnimationFrame(frameId)
      mobileQuery.removeEventListener('change', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('orientationchange', scheduleUpdate)
      window.visualViewport?.removeEventListener('resize', scheduleUpdate)
    },
  }
}
