import type { AssetProgress } from '../scene/assets/assetManager'

interface StartupLoader {
  setFoundationReady(): void
  beginAssetLoading(expectedRequests: number): void
  updateAssetProgress(progress: AssetProgress): void
  complete(): void
}

interface TrackedAsset {
  loaded: number
  total: number | null
}

const FOUNDATION_PROGRESS = 30
const ASSET_PROGRESS_RANGE = 64

export function createStartupLoader(
  root: HTMLElement,
  bar: HTMLElement,
  label: HTMLElement,
): StartupLoader {
  const assets = new Map<string, TrackedAsset>()
  let expectedRequests = 1
  let displayedProgress = 0
  let complete = false

  const render = (progress: number, text: string): void => {
    // Network responses can reveal their size at slightly different times.
    // Never move the visual indicator backwards when another request appears.
    displayedProgress = Math.max(displayedProgress, Math.min(100, progress))
    const rounded = Math.round(displayedProgress)
    bar.style.width = `${displayedProgress}%`
    label.textContent = `${text} · ${rounded}%`
    root.dataset.progress = String(rounded)
    root.setAttribute('aria-valuenow', String(rounded))
  }

  render(8, 'opening studio')

  return {
    setFoundationReady() {
      if (complete) return
      render(FOUNDATION_PROGRESS, 'building studio')
    },
    beginAssetLoading(requestCount) {
      if (complete) return
      expectedRequests = Math.max(1, requestCount)
      root.dataset.status = 'loading-assets'
      render(FOUNDATION_PROGRESS, 'loading studio')
    },
    updateAssetProgress(progress) {
      if (complete) return
      assets.set(progress.url, { loaded: progress.loaded, total: progress.total })

      let requestProgress = 0
      for (const asset of assets.values()) {
        if (asset.total && asset.total > 0) requestProgress += Math.min(1, asset.loaded / asset.total)
      }
      const ratio = Math.min(1, requestProgress / expectedRequests)
      render(FOUNDATION_PROGRESS + ratio * ASSET_PROGRESS_RANGE, 'loading studio')
    },
    complete() {
      if (complete) return
      complete = true
      root.dataset.status = 'ready'
      render(100, 'studio ready')
      window.setTimeout(() => root.classList.add('done'), 420)
    },
  }
}
