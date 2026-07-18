import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/DEV/posters/Portfolio.webp').then((m) => m.default)

const loadVideo = () =>
  import('../../assets/DEV/Portfolio.mp4').then((m) => m.default)

export default createProjectAssetLoader(loadThumbnail, async () => [await loadVideo()])
