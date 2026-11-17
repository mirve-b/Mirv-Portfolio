import type { SpotifyIframeApi } from './spotifyIframeApi.types'

const IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

let scriptRequested = false
let apiReadyPromise: Promise<SpotifyIframeApi | null> | null = null

function injectScript() {
  if (scriptRequested || typeof document === 'undefined') return
  scriptRequested = true

  if (document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = IFRAME_API_SRC
  script.async = true
  document.head.appendChild(script)
}

/** Phones and touch devices retry mounting the player a little faster. */
/**
 * Spotify's iFrame API has no global object: the ONLY way to get it is the one-time
 * `window.onSpotifyIframeApiReady(api)` call it makes when its script loads. We catch that call
 * here, as early as possible, and keep the API, so the player can be created at any moment
 * later (on click, or after the intro) and still find it. Without this, a player created after
 * the script had loaded waited forever on "Loading player…".
 */
let api: SpotifyIframeApi | null = null

export function preloadSpotifyIframeApi(): Promise<SpotifyIframeApi | null> {
  if (typeof window === 'undefined') return Promise.resolve(null)
  if (api) return Promise.resolve(api)

  if (!apiReadyPromise) {
    apiReadyPromise = new Promise((resolve) => {
      const previousReady = window.onSpotifyIframeApiReady
      window.onSpotifyIframeApiReady = (ready) => {
        api = ready
        previousReady?.(ready)
        resolve(ready)
      }
      injectScript()
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
