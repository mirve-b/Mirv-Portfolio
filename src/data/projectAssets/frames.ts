import { createProjectAssetLoader } from './types'

const loadVideo = () =>
  import('../../assets/ART/Frames/eyes.MP4').then((m) => m.default)

const loadThumbnail = loadVideo

const loadGallery = async () => [await loadVideo()]

export default createProjectAssetLoader(loadThumbnail, loadGallery)
