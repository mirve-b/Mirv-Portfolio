import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/DEV/posters/ATS CV.webp').then((m) => m.default)

const loadVideo = () =>
  import('../../assets/DEV/ATS CV.mp4').then((m) => m.default)

export default createProjectAssetLoader(loadThumbnail, async () => [await loadVideo()])
