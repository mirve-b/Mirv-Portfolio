import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/Collage/File.webp').then((m) => m.default)

const loadGallery = async () => [await loadThumbnail()]

export default createProjectAssetLoader(loadThumbnail, loadGallery)
