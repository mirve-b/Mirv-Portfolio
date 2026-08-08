import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/UI-UX/MOLLY/Frame 1.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/UI-UX/MOLLY/Frame 1.webp').then((m) => m.default),
    import('../../assets/UI-UX/MOLLY/Frame 2.webp').then((m) => m.default),
    import('../../assets/UI-UX/MOLLY/Frame 3.webp').then((m) => m.default),
    import('../../assets/UI-UX/MOLLY/4.mp4').then((m) => m.default),
    import('../../assets/UI-UX/MOLLY/5.mp4').then((m) => m.default),
    import('../../assets/UI-UX/MOLLY/6.mp4').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
