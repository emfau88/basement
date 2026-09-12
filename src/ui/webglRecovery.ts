import { requiredElement } from './dom'

export interface WebGLRecoveryUI {
  show(): void
  hide(): void
}

export function createWebGLRecoveryUI(): WebGLRecoveryUI {
  const element = requiredElement<HTMLElement>('webglRecovery')
  return {
    show: () => { element.hidden = false },
    hide: () => { element.hidden = true },
  }
}
