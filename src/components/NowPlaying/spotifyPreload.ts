const IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

let scriptRequested = false
let apiReadyPromise: Promise<void> | null = null

function injectScript() {
  if (scriptRequested || typeof document === 'undefined') return
  scriptRequested = true

  if (document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = IFRAME_API_SRC
  script.async = true
  document.head.appendChild(script)
}

export function prefersFastSpotifyWarmup(): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches
}

/** Load Spotify iFrame API as early as possible */
export function preloadSpotifyIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  if (window.Spotify?.IframeApi) return Promise.resolve()

  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve) => {
      const finish = () => resolve()

      const previousReady = window.onSpotifyIframeApiReady

      window.onSpotifyIframeApiReady = (api) => {
        previousReady?.(api)
        finish()
      }

      injectScript()

      if (window.Spotify?.IframeApi) {
        finish()
      }
    })
  }

  return apiReadyPromise
}

export function scheduleSpotifyWarmup(work: () => void, delayMs = 1200): () => void {
  if (typeof window === 'undefined') return () => {}

  if (prefersFastSpotifyWarmup()) {
    const timer = window.setTimeout(work, 120)
    return () => window.clearTimeout(timer)
  }

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(work, { timeout: delayMs })
    return () => window.cancelIdleCallback(id)
  }

  const timer = window.setTimeout(work, Math.min(delayMs, 800))
  return () => window.clearTimeout(timer)
}
