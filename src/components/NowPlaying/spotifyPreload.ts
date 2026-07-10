const IFRAME_API_SRC = 'https://open.spotify.com/embed/iframe-api/v1'

let scriptRequested = false

/** Load Spotify iFrame API as early as possible — before NowPlaying mounts */
export function preloadSpotifyIframeApi() {
  if (scriptRequested || typeof document === 'undefined') return
  scriptRequested = true

  if (document.querySelector(`script[src="${IFRAME_API_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = IFRAME_API_SRC
  script.async = true
  document.body.appendChild(script)
}
