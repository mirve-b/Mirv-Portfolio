const SMOOTH_PAUSE_MS = 380

type SpotifyPlaybackControls = {
  pause: () => void
  smoothPause: () => void
  closeDrawer: () => void
}

type SpotifyPlaybackStartListener = () => void

let controls: SpotifyPlaybackControls | null = null
const playbackStartListeners = new Set<SpotifyPlaybackStartListener>()

export function registerSpotifyControls(next: SpotifyPlaybackControls): () => void {
  controls = next
  return () => {
    if (controls === next) controls = null
  }
}

export function smoothPauseSpotifyPlayback(): void {
  controls?.smoothPause()
}

export function pauseSpotifyPlayback(): void {
  controls?.pause()
}

/** Pause Spotify and unmute/play video while the click gesture is still active. */
export async function unmuteVideoWithSpotifyHandoff(
  video: HTMLVideoElement,
): Promise<boolean> {
  pauseSpotifyPlayback()
  smoothPauseSpotifyPlayback()

  video.muted = false
  video.loop = true

  try {
    if (video.paused) {
      await video.play()
    }
    return true
  } catch {
    video.muted = true
    return false
  }
}

export function subscribeSpotifyPlaybackStart(
  listener: SpotifyPlaybackStartListener,
): () => void {
  playbackStartListeners.add(listener)
  return () => {
    playbackStartListeners.delete(listener)
  }
}

export function notifySpotifyPlaybackStart(): void {
  playbackStartListeners.forEach((listener) => listener())
}

export { SMOOTH_PAUSE_MS }
