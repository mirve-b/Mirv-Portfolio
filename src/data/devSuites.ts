import kaelThumbnailVideo from '../assets/DEV/kael_thumbnail.mp4'

export type DevSuiteMedia = {
  previewVideoSrc: string
}

const DEV_SUITE_MEDIA: Record<string, DevSuiteMedia> = {
  kael: {
    previewVideoSrc: kaelThumbnailVideo,
  },
}

export function getDevSuiteMedia(suiteId: string): DevSuiteMedia | undefined {
  return DEV_SUITE_MEDIA[suiteId]
}
