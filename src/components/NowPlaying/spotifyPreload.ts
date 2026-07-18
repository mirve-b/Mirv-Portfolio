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

/** Load Spotify iFrame API as early as possible */
export function preloadSpotifyIframeApi(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()

  if (window.Spotify?.IframeApi) return Promise.resolve()

  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve) => {
      const previousReady = window.onSpotifyIframeApiReady

      window.onSpotifyIframeApiReady = (api) => {
        previousReady?.(api)
        resolve()
      }

      injectScript()

      if (window.Spotify?.IframeApi) {
        resolve()
      }
    })
  }

  return apiReadyPromise
}

export function scheduleSpotifyWarmup(work: () => void, delayMs = 1200): () => void {
  if (typeof window === 'undefined') return () => {}

  if (typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(work, { timeout: delayMs })
    return () => window.cancelIdleCallback(id)
  }

  const timer = window.setTimeout(work, Math.min(delayMs, 800))
  return () => window.clearTimeout(timer)
}
