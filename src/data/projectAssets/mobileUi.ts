import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/Notes/ui_ux.webp').then((m) => m.default)

const loadGallery = async () => [await loadThumbnail()]

export default createProjectAssetLoader(loadThumbnail, loadGallery)
