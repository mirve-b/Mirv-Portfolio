import type { ExpertiseCategory } from '../lib/pageNavigation'

export type ProjectDetailType = 'gallery' | 'video-showcase'
export type ThumbnailType = 'image' | 'video'

export type PortfolioProjectMeta = {
  id: string
  category: ExpertiseCategory
  title: string
  subtitle: string
  thumbnailType?: ThumbnailType
  thumbnailPosition?: string
  detailType?: ProjectDetailType
  galleryMaxColumns?: number
}

export type PortfolioProject = PortfolioProjectMeta & {
  thumbnail: string
  gallery: string[]
}

/**
 * Portfolio metadata — assets are loaded on demand via projectAssets/.
 */
export const PORTFOLIO_PROJECTS: PortfolioProjectMeta[] = [
  {
    id: 'after-hours',
    category: 'art',
    title: 'After Hours',
    subtitle: 'Portraits',
    detailType: 'gallery',
  },
  {
    id: 'second-skin',
    category: 'art',
    title: 'Second Skin',
    subtitle: 'Character Concepts',
    detailType: 'gallery',
  },
  {
    id: 'archive',
    category: 'art',
    title: 'Archive',
    subtitle: 'Illustrations',
    detailType: 'gallery',
  },
  {
    id: 'story-shelf',
    category: 'art',
    title: 'Story Shelf',
    subtitle: "Children's book illustrations",
    detailType: 'gallery',
    galleryMaxColumns: 3,
  },
  {
    id: 'toy-box',
    category: 'art',
    title: 'TOY BOX',
    subtitle: 'Mirvé Kids',
    detailType: 'gallery',
  },
  {
    id: 'frames',
    category: 'art',
    title: 'Frames',
    subtitle: 'Animations',
    thumbnailType: 'video',
    detailType: 'gallery',
  },
  {
    id: 'kael-profile',
    category: 'development',
    title: 'KAEL — Profile',
    subtitle: 'AI profile generation',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-case-study',
    category: 'development',
    title: 'KAEL — Case Study',
    subtitle: 'Automated case study builder',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-portfolio',
    category: 'development',
    title: 'KAEL — Portfolio',
    subtitle: 'Interactive portfolio templates',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-ats-cv',
    category: 'development',
    title: 'KAEL — ATS CV',
    subtitle: 'ATS-compatible resume export',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-job-match',
    category: 'development',
    title: 'KAEL — Job Match',
    subtitle: 'AI job description matching',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'blvck',
    category: 'ui-ux',
    title: 'BLVCK',
    subtitle: 'Online Jewellery Store',
    detailType: 'gallery',
    galleryMaxColumns: 1,
  },
  {
    id: 'doubleu',
    category: 'ui-ux',
    title: 'DOUBLEU',
    subtitle: 'Clothing Brand Website',
    detailType: 'gallery',
    galleryMaxColumns: 1,
  },
]

export function getProjectsMetaForCategory(
  category: ExpertiseCategory,
): PortfolioProjectMeta[] {
  return PORTFOLIO_PROJECTS.filter((project) => project.category === category)
}

export function getProjectMetaById(projectId: string): PortfolioProjectMeta | undefined {
  return PORTFOLIO_PROJECTS.find((project) => project.id === projectId)
}

export function isProjectOpenable(project: PortfolioProjectMeta): boolean {
  return project.detailType === 'gallery'
}

export function isVideoShowcase(project: PortfolioProjectMeta): boolean {
  return project.detailType === 'video-showcase'
}
