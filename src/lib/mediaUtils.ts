const VIDEO_EXTENSION = /\.(mp4|webm|mov)(\?|$)/i

export function isVideoAsset(src: string): boolean {
  return VIDEO_EXTENSION.test(src)
}

export function preloadMediaAsset(src: string, eager = false): void {
  if (isVideoAsset(src)) {
    const video = document.createElement('video')
    video.preload = eager ? 'auto' : 'metadata'
    video.src = src
    video.load()
    return
  }

  const img = new Image()
  if (eager) {
    img.fetchPriority = 'high'
  }
  img.decoding = 'async'
  img.src = src
}

export function primeVideoFrame(video: HTMLVideoElement): void {
  const seekToFrame = () => {
    if (video.readyState >= 2 && video.currentTime === 0) {
      video.currentTime = 0.001
    }
  }

  if (video.readyState >= 2) {
    seekToFrame()
    return
  }

  video.addEventListener('loadeddata', seekToFrame, { once: true })
}

export async function startMutedPreview(video: HTMLVideoElement): Promise<void> {
  video.muted = true
  video.loop = true
  video.playsInline = true

  try {
    await video.play()
  } catch {
    primeVideoFrame(video)
  }
}
