import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/DEV/posters/JOB MATCH.webp').then((m) => m.default)

const loadVideo = () =>
  import('../../assets/DEV/JOB MATCH.mp4').then((m) => m.default)

export default createProjectAssetLoader(loadThumbnail, async () => [await loadVideo()])
