import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/After hours/thumbnail.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/ART/After hours/1.webp').then((m) => m.default),
    import('../../assets/ART/After hours/2.webp').then((m) => m.default),
    import('../../assets/ART/After hours/3.webp').then((m) => m.default),
    import('../../assets/ART/After hours/4.webp').then((m) => m.default),
    import('../../assets/ART/After hours/5.webp').then((m) => m.default),
    import('../../assets/ART/After hours/6.webp').then((m) => m.default),
    import('../../assets/ART/After hours/7.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
