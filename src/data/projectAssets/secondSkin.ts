import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/Second Skin/thumbnail.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/ART/Second Skin/1.webp').then((m) => m.default),
    import('../../assets/ART/Second Skin/2.webp').then((m) => m.default),
    import('../../assets/ART/Second Skin/3.webp').then((m) => m.default),
    import('../../assets/ART/Second Skin/4.webp').then((m) => m.default),
    import('../../assets/ART/Second Skin/5.webp').then((m) => m.default),
    import('../../assets/ART/Second Skin/6.webp').then((m) => m.default),
    import('../../assets/ART/Second Skin/7.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
