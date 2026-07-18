import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/DEV/posters/Profile.webp').then((m) => m.default)

const loadVideo = () =>
  import('../../assets/DEV/Profile.mp4').then((m) => m.default)

export default createProjectAssetLoader(loadThumbnail, async () => [await loadVideo()])
