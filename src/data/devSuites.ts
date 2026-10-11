import kaelThumbnailVideo from '../assets/DEV/kael_thumbnail.mp4'
import mablePreview from '../assets/DEV/mable.webp'

export type DevSuiteMedia = {
  previewVideoSrc?: string
  previewImageSrc?: string
}

const DEV_SUITE_MEDIA: Record<string, DevSuiteMedia> = {
  kael: {
    previewVideoSrc: kaelThumbnailVideo,
  },
  mable: {
    previewImageSrc: mablePreview,
  },
}

export function getDevSuiteMedia(suiteId: string): DevSuiteMedia | undefined {
  return DEV_SUITE_MEDIA[suiteId]
}
