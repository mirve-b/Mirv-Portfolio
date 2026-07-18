import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/UI-UX/DOUBLEU/1.png').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/UI-UX/DOUBLEU/1.png').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/2.png').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/3.png').then((m) => m.default),
    import('../../assets/UI-UX/DOUBLEU/4.png').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
