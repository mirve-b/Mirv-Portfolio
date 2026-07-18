import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/DEV/posters/CaseStudy.webp').then((m) => m.default)

const loadVideo = () =>
  import('../../assets/DEV/CaseStudy.mp4').then((m) => m.default)

export default createProjectAssetLoader(loadThumbnail, async () => [await loadVideo()])
