const VIDEO_EXTENSION = /\.(mp4|webm|mov)(\?|$)/i
const MOBILE_MEDIA_MQ = '(max-width: 768px), (hover: none) and (pointer: coarse)'
const MAX_CONCURRENT_VIDEO_METADATA_LOADS = 2

let activeMetadataLoads = 0
const metadataLoadQueue: Array<() => void> = []

export function isVideoAsset(src: string): boolean {
  return VIDEO_EXTENSION.test(src)
}

function prefersLimitedVideoLoading(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_MEDIA_MQ).matches
}

function releaseMetadataLoadSlot() {
  activeMetadataLoads = Math.max(0, activeMetadataLoads - 1)
  const next = metadataLoadQueue.shift()
  if (next) next()
}

export function runVideoMetadataLoad(work: () => void): () => void {
  if (!prefersLimitedVideoLoading()) {
    work()
    return () => {}
  }

  let cancelled = false

  const run = () => {
    if (cancelled) return
    activeMetadataLoads += 1
    work()
  }

  if (activeMetadataLoads < MAX_CONCURRENT_VIDEO_METADATA_LOADS) {
    run()
  } else {
    metadataLoadQueue.push(run)
  }

  return () => {
    cancelled = true
  }
}

export function finishVideoMetadataLoad() {
  if (!prefersLimitedVideoLoading()) return
  releaseMetadataLoadSlot()
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
