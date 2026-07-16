import { createProjectAssetLoader } from './types'

const loadVideo = () =>
  import('../../assets/DEV/Profile.mp4').then((m) => m.default)

export default createProjectAssetLoader(loadVideo, async () => [await loadVideo()])
