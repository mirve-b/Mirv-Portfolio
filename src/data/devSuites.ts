import kaelThumbnailVideo from '../assets/DEV/KAEL/kael_thumbnail.mp4'
import mableThumbnailVideo from '../assets/DEV/MABLE/thumbnail.mp4'

export type DevSuiteMedia = {
  previewVideoSrc?: string
  previewImageSrc?: string
  previewOnly?: boolean
}

const DEV_SUITE_MEDIA: Record<string, DevSuiteMedia> = {
  kael: {
    previewVideoSrc: kaelThumbnailVideo,
  },
  mable: {
    previewVideoSrc: mableThumbnailVideo,
    previewOnly: true,
  },
}

export function getDevSuiteMedia(suiteId: string): DevSuiteMedia | undefined {
  return DEV_SUITE_MEDIA[suiteId]
}
