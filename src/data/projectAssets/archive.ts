import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/Archive/thumbnail.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/ART/Archive/1.webp').then((m) => m.default),
    import('../../assets/ART/Archive/2.webp').then((m) => m.default),
    import('../../assets/ART/Archive/3.webp').then((m) => m.default),
    import('../../assets/ART/Archive/4.webp').then((m) => m.default),
    import('../../assets/ART/Archive/5.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
