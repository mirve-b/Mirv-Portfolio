import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/TOY BOX/thumbnail.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/ART/TOY BOX/1.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/2.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/3.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/4.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/5.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/6.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/7.webp').then((m) => m.default),
    import('../../assets/ART/TOY BOX/8.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
