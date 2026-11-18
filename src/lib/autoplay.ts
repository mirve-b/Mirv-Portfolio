/**
 * Background films: always muted, inline and looping, so phones let them autoplay. Set as real
 * attributes too, because iOS Safari decides on autoplay from the attributes.
 */
export function prepareAutoplay(video: HTMLVideoElement): void {
  video.muted = true
  video.defaultMuted = true
  video.loop = true
  video.playsInline = true
  video.setAttribute('muted', '')
  video.setAttribute('playsinline', '')
  video.setAttribute('webkit-playsinline', '')
}

const waiting = new Set<HTMLVideoElement>()
let listening = false
const GESTURES = ['touchend', 'pointerup', 'click', 'keydown'] as const

function retryWaiting() {
  waiting.forEach((video) => {
    if (!video.isConnected) {
      waiting.delete(video)
      return
    }
    video
      .play()
      .then(() => waiting.delete(video))
      .catch(() => {})
  })
  if (!waiting.size) {
    GESTURES.forEach((type) => window.removeEventListener(type, retryWaiting, true))
    listening = false
  }
}

/**
 * Play a background film. If the phone refuses (iOS Low Power Mode blocks autoplay), it starts
 * on the visitor's first touch anywhere on the page instead of showing a play button.
 */
export function playBackground(video: HTMLVideoElement): void {
  prepareAutoplay(video)
  video.play().catch(() => {
    waiting.add(video)
    if (listening) return
    listening = true
    GESTURES.forEach((type) => window.addEventListener(type, retryWaiting, { capture: true, passive: true }))
  })
}

export function pauseBackground(video: HTMLVideoElement): void {
  waiting.delete(video)
  video.pause()
}
