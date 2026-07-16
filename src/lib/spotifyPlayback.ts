const SMOOTH_PAUSE_MS = 380

type SpotifyPlaybackControls = {
  pause: () => void
  smoothPause: () => void
  closeDrawer: () => void
}

let controls: SpotifyPlaybackControls | null = null

export function registerSpotifyControls(next: SpotifyPlaybackControls): () => void {
  controls = next
  return () => {
    if (controls === next) controls = null
  }
}

export function stopSpotifyPlayback(): void {
  controls?.pause()
  controls?.closeDrawer()
}

export function smoothPauseSpotifyPlayback(): void {
  controls?.smoothPause()
}

export { SMOOTH_PAUSE_MS }
