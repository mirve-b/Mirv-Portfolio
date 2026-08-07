import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/TOY BOX/thumbnail.webp').then((m) => m.default)

const loadGallery = async () => []

export default createProjectAssetLoader(loadThumbnail, loadGallery)
