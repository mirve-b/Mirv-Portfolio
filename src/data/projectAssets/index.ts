import type { ExpertiseCategory } from '../../lib/pageNavigation'
import { getProjectsMetaForCategory, type PortfolioProjectMeta } from '../portfolioProjects'
import type { LoadedProjectAssets, ProjectAssetLoader } from './types'

const loaderByProjectId: Record<string, () => Promise<{ default: ProjectAssetLoader }>> = {
  'after-hours': () => import('./afterHours'),
  'second-skin': () => import('./secondSkin'),
  archive: () => import('./archive'),
  'story-shelf': () => import('./toyBox'),
  'toy-box': () => import('./storyShelf'),
  frames: () => import('./frames'),
  'kael-profile': () => import('./kaelProfile'),
  'kael-case-study': () => import('./kaelCaseStudyVideo'),
  'kael-portfolio': () => import('./kaelPortfolio'),
  'kael-ats-cv': () => import('./kaelAtsCv'),
  'kael-job-match': () => import('./kaelJobMatch'),
  blvck: () => import('./blvck'),
  doubleu: () => import('./doubleu'),
  'product-flow': () => import('./productFlow'),
  'mobile-ui': () => import('./mobileUi'),
}

const loaderCache = new Map<string, ProjectAssetLoader>()

async function getLoader(projectId: string): Promise<ProjectAssetLoader> {
  const cached = loaderCache.get(projectId)
  if (cached) return cached

  const importLoader = loaderByProjectId[projectId]
  if (!importLoader) {
    throw new Error(`No asset loader registered for project "${projectId}"`)
  }

  const module = await importLoader()
  loaderCache.set(projectId, module.default)
  return module.default
}

export async function loadProjectThumbnail(projectId: string): Promise<string> {
  const loader = await getLoader(projectId)
  return loader.loadThumbnail()
}

export async function loadProjectAssets(projectId: string): Promise<LoadedProjectAssets> {
  const loader = await getLoader(projectId)
  return loader.loadAll()
}

export async function loadCategoryThumbnails(
  category: ExpertiseCategory,
): Promise<Record<string, string>> {
  const projects = getProjectsMetaForCategory(category)
  const entries = await Promise.all(
    projects.map(async (project) => {
      const thumbnail = await loadProjectThumbnail(project.id)
      return [project.id, thumbnail] as const
    }),
  )
  return Object.fromEntries(entries)
}

export function mergeProjectWithAssets(
  meta: PortfolioProjectMeta,
  assets: LoadedProjectAssets,
) {
  return { ...meta, ...assets }
}
