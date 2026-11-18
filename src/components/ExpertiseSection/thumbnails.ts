import { useEffect, useState } from 'react'
import { loadCategoryThumbnails } from '../../data/projectAssets'
import { getDevSuiteMedia } from '../../data/devSuites'
import { getCategoryGridProjects, getDevTabProjects } from '../../data/portfolioProjects'
import { isVideoAsset } from '../../lib/mediaUtils'
import type { ExpertiseCategory } from '../../lib/pageNavigation'

/** Thumbnail URLs per work page, kept once loaded so a page always opens with its pictures. */
const thumbnailCache = new Map<ExpertiseCategory, Record<string, string>>()

async function getThumbnails(category: ExpertiseCategory): Promise<Record<string, string>> {
  const cached = thumbnailCache.get(category)
  if (cached) return cached
  const next = await loadCategoryThumbnails(category)
  thumbnailCache.set(category, next)
  return next
}

export function useCategoryThumbnails(category: ExpertiseCategory) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(() => thumbnailCache.get(category) ?? {})
  const [loading, setLoading] = useState(() => !thumbnailCache.has(category))

  useEffect(() => {
    const cached = thumbnailCache.get(category)
    if (cached) {
      setThumbnails(cached)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    getThumbnails(category)
      .then((next) => {
        if (!cancelled) setThumbnails(next)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [category])

  return { thumbnails, loading }
}

/** Fetch and decode one picture, or the first frame of one film, so it's ready to show at once. */
function warmMedia(url: string): Promise<void> {
  if (isVideoAsset(url)) {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'
      const done = () => resolve()
      video.addEventListener('loadeddata', done, { once: true })
      video.addEventListener('error', done, { once: true })
      video.src = url
      video.load()
    })
  }
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  return img.decode().catch(() => {})
}

/**
 * Get a work page ready while the black curtain is still up: its thumbnail list, plus the first
 * card's picture downloaded and decoded. The page then appears already complete, instead of
 * showing its frames first and the pictures a moment later.
 */
export async function warmExpertisePage(category: ExpertiseCategory): Promise<void> {
  try {
    const thumbs = await getThumbnails(category)
    const projects = category === 'development' ? getDevTabProjects() : getCategoryGridProjects(category)
    const urls = projects
      // the first card is what fills the screen when the page appears; the rest load as you scroll
      .slice(0, 1)
      .map((project) => {
        if (category !== 'development') return thumbs[project.id]
        const media = getDevSuiteMedia(project.id)
        return media?.previewImageSrc ?? media?.previewVideoSrc
      })
      .filter((url): url is string => !!url)
    await Promise.all(urls.map(warmMedia))
  } catch {
    /* the page still opens, just without the head start */
  }
}
