import { createProjectAssetLoader } from './types'

const loadThumbnail = () =>
  import('../../assets/ART/TOY BOX/thumbnail.webp').then((m) => m.default)

const loadCharacterGallery = () =>
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

const loadStoryGallery = () =>
  Promise.all([
    import('../../assets/ART/StoryShelf/Thumbnail.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/1.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/3.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/4.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/5.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/6.webp').then((m) => m.default),
    import('../../assets/ART/StoryShelf/7.webp').then((m) => m.default),
  ])

const loadGallery = async () => {
  const [characters, stories] = await Promise.all([
    loadCharacterGallery(),
    loadStoryGallery(),
  ])
  return [...characters, ...stories]
}

const loadSectionGalleries = async () => {
  const [characters, stories] = await Promise.all([
    loadCharacterGallery(),
    loadStoryGallery(),
  ])
  return [characters, stories]
}

export default createProjectAssetLoader(loadThumbnail, loadGallery, loadSectionGalleries)
