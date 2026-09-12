/** Keep the CSS media queries in responsive.css in sync with this value. */
export const MOBILE_BREAKPOINT_PX = 760
export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT_PX}px)`

export const isMobileViewport = (): boolean => window.matchMedia(MOBILE_MEDIA_QUERY).matches
