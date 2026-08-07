export type LoadedProjectAssets = {
  thumbnail: string
  gallery: string[]
  sectionGalleries?: string[][]
}

export type ProjectAssetLoader = {
  loadThumbnail: () => Promise<string>
  loadGallery: () => Promise<string[]>
  loadAll: () => Promise<LoadedProjectAssets>
}

export function createProjectAssetLoader(
  loadThumbnail: () => Promise<string>,
  loadGallery: () => Promise<string[]>,
  loadSectionGalleries?: () => Promise<string[][]>,
): ProjectAssetLoader {
  return {
    loadThumbnail,
    loadGallery,
    async loadAll() {
      const [thumbnail, gallery, sectionGalleries] = await Promise.all([
        loadThumbnail(),
        loadGallery(),
        loadSectionGalleries ? loadSectionGalleries() : Promise.resolve(undefined),
      ])
      return sectionGalleries ? { thumbnail, gallery, sectionGalleries } : { thumbnail, gallery }
    },
  }
}
