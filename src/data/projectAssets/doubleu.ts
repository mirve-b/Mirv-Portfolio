import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/UI-UX/DOUBLEU/1.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/UI-UX/DOUBLEU/1.webp').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/prototype.mp4').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/2.webp').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/3.webp').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/4.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
