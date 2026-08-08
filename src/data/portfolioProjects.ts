import type { ExpertiseCategory } from '../lib/pageNavigation'

export type ProjectDetailType = 'gallery' | 'video-showcase' | 'dev-suite' | 'art-suite'
export type ThumbnailType = 'image' | 'video'

export type PortfolioProjectMeta = {
  id: string
  category: ExpertiseCategory
  title: string
  subtitle: string
  description?: string
  techStack?: string[]
  parentSuiteId?: string
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
    id: 'somewhere-else',
    category: 'art',
    title: 'SOMEWHERE ELSE',
    subtitle: 'NARRATIVE ILLUSTRATIONS',
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
    id: 'toy-box',
    category: 'art',
    title: 'TOY BOX',
    subtitle: 'Mirvé Kids',
    detailType: 'art-suite',
  },
  {
    id: 'character-designs',
    category: 'art',
    parentSuiteId: 'toy-box',
    title: 'Character Designs',
    subtitle: 'TOY BOX',
    detailType: 'gallery',
  },
  {
    id: 'childrens-book-illustrations',
    category: 'art',
    parentSuiteId: 'toy-box',
    title: "Children's Book Illustrations",
    subtitle: 'TOY BOX',
    detailType: 'gallery',
    galleryMaxColumns: 3,
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
    id: 'kael',
    category: 'development',
    title: 'KAEL',
    subtitle: 'AI career toolkit',
    description:
      'An AI-powered suite for profiles, portfolios, ATS resumes, case studies, and job-matched applications, built end to end as a cohesive product experience.',
    techStack: ['Flutter / Dart'],
    detailType: 'dev-suite',
  },
  {
    id: 'kael-profile',
    category: 'development',
    parentSuiteId: 'kael',
    title: 'KAEL — Profile',
    subtitle: 'AI profile generation',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-case-study',
    category: 'development',
    parentSuiteId: 'kael',
    title: 'KAEL — Case Study',
    subtitle: 'Automated case study builder',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-portfolio',
    category: 'development',
    parentSuiteId: 'kael',
    title: 'KAEL — Portfolio',
    subtitle: 'Interactive portfolio templates',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-ats-cv',
    category: 'development',
    parentSuiteId: 'kael',
    title: 'KAEL — ATS CV',
    subtitle: 'ATS-compatible resume export',
    thumbnailType: 'video',
    detailType: 'video-showcase',
  },
  {
    id: 'kael-job-match',
    category: 'development',
    parentSuiteId: 'kael',
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
  {
    id: 'molly',
    category: 'ui-ux',
    title: 'MOLLY',
    subtitle: 'Product Design',
    detailType: 'gallery',
    galleryMaxColumns: 1,
  },
]

export function getProjectsMetaForCategory(
  category: ExpertiseCategory,
): PortfolioProjectMeta[] {
  return PORTFOLIO_PROJECTS.filter((project) => project.category === category)
}

/** Top-level cards for an expertise tab (excludes nested suite children). */
export function getCategoryGridProjects(
  category: ExpertiseCategory,
): PortfolioProjectMeta[] {
  return getProjectsMetaForCategory(category).filter((project) => !project.parentSuiteId)
}

export function getDevTabProjects(): PortfolioProjectMeta[] {
  return PORTFOLIO_PROJECTS.filter(
    (project) => project.category === 'development' && project.detailType === 'dev-suite',
  )
}

export function getDevSuiteShowcaseProjects(suiteId: string): PortfolioProjectMeta[] {
  return PORTFOLIO_PROJECTS.filter(
    (project) => project.parentSuiteId === suiteId && project.detailType === 'video-showcase',
  )
}

export function getArtSuiteProjects(suiteId: string): PortfolioProjectMeta[] {
  return PORTFOLIO_PROJECTS.filter(
    (project) => project.parentSuiteId === suiteId && project.detailType === 'gallery',
  )
}

export function getProjectMetaById(projectId: string): PortfolioProjectMeta | undefined {
  return PORTFOLIO_PROJECTS.find((project) => project.id === projectId)
}

export function isProjectOpenable(project: PortfolioProjectMeta): boolean {
  return (
    project.detailType === 'gallery' ||
    project.detailType === 'dev-suite' ||
    project.detailType === 'art-suite'
  )
}

export function isVideoShowcase(project: PortfolioProjectMeta): boolean {
  return project.detailType === 'video-showcase'
}
