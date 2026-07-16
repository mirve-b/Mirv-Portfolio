export type LoadedProjectAssets = {
  thumbnail: string
  gallery: string[]
}

export type ProjectAssetLoader = {
  loadThumbnail: () => Promise<string>
  loadGallery: () => Promise<string[]>
  loadAll: () => Promise<LoadedProjectAssets>
}

export function createProjectAssetLoader(
  loadThumbnail: () => Promise<string>,
  loadGallery: () => Promise<string[]>,
): ProjectAssetLoader {
  return {
    loadThumbnail,
    loadGallery,
    async loadAll() {
      const [thumbnail, gallery] = await Promise.all([loadThumbnail(), loadGallery()])
      return { thumbnail, gallery }
    },
  }
}
