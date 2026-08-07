import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/SOMEWHERE ELSE/thumbnail.png').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/ART/SOMEWHERE ELSE/1.MP4').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
