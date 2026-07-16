import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/UI-UX/BLVCK/1.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/UI-UX/BLVCK/1.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/2.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/3.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/4.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/5.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/6.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/7.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/8.webp').then((m) => m.default),
    import('../../assets/UI-UX/BLVCK/9.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
