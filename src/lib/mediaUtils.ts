const VIDEO_EXTENSION = /\.(mp4|webm|mov)(\?|$)/i

const preloadedUrls = new Set<string>()
const inFlightUrls = new Set<string>()

export function isVideoAsset(src: string): boolean {
  return VIDEO_EXTENSION.test(src)
}

function markComplete(src: string): void {
  inFlightUrls.delete(src)
  preloadedUrls.add(src)
}

function scheduleIdleWork(work: () => void): void {
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(work, { timeout: 2000 })
    return
  }

  window.setTimeout(work, 150)
}

export function preloadMediaAsset(src: string, eager = false): void {
  if (preloadedUrls.has(src) || inFlightUrls.has(src)) return

  inFlightUrls.add(src)

  if (isVideoAsset(src)) {
    const video = document.createElement('video')
    video.preload = eager ? 'auto' : 'metadata'
    video.onloadeddata = () => markComplete(src)
    video.onerror = () => inFlightUrls.delete(src)
    video.src = src
    video.load()
    return
  }

  const img = new Image()
  img.onload = () => markComplete(src)
  img.onerror = () => inFlightUrls.delete(src)
  if (eager) {
    img.fetchPriority = 'high'
  }
  img.decoding = 'async'
  img.src = src
}

export function preloadMediaBatch(urls: string[], batchSize = 2): void {
  const pending = urls.filter((url) => !preloadedUrls.has(url) && !inFlightUrls.has(url))
  if (pending.length === 0) return

  let index = 0

  const runBatch = () => {
    const batch = pending.slice(index, index + batchSize)
    index += batchSize
    batch.forEach((src) => preloadMediaAsset(src, false))

    if (index < pending.length) {
      scheduleIdleWork(runBatch)
    }
  }

  scheduleIdleWork(runBatch)
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
