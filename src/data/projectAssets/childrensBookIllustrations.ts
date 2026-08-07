import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/StoryShelf/Thumbnail.webp').then((m) => m.default)

const loadGallery = () =>
  Promise.all([
    import('../../assets/ART/StoryShelf/1.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/3.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/4.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/5.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/6.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/7.webp').then((m) => m.default),
  ])

export default createProjectAssetLoader(loadThumbnail, loadGallery)
