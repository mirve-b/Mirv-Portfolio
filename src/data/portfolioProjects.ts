import afterHoursThumbnail from '../assets/ART/After hours/thumbnail.PNG'
import afterHours1 from '../assets/ART/After hours/1.png'
import afterHours2 from '../assets/ART/After hours/2.png'
import afterHours3 from '../assets/ART/After hours/3.png'
import afterHours4 from '../assets/ART/After hours/4.PNG'
import afterHours5 from '../assets/ART/After hours/5.PNG'
import afterHours6 from '../assets/ART/After hours/6.png'
import afterHours7 from '../assets/ART/After hours/7.PNG'
import secondSkinThumbnail from '../assets/ART/Second Skin/thumbnail.png'
import secondSkin1 from '../assets/ART/Second Skin/1.png'
import secondSkin2 from '../assets/ART/Second Skin/2.png'
import secondSkin3 from '../assets/ART/Second Skin/3.png'
import secondSkin4 from '../assets/ART/Second Skin/4.png'
import secondSkin5 from '../assets/ART/Second Skin/5.png'
import secondSkin6 from '../assets/ART/Second Skin/6.png'
import secondSkin7 from '../assets/ART/Second Skin/7.png'
import archiveThumbnail from '../assets/ART/Archive/thumbnail.png'
import archive1 from '../assets/ART/Archive/1.png'
import archive2 from '../assets/ART/Archive/2.png'
import archive3 from '../assets/ART/Archive/3.png'
import archive4 from '../assets/ART/Archive/4.png'
import archive5 from '../assets/ART/Archive/5.png'
import storyShelfThumbnail from "../assets/ART/Children's Picture Books/thumbnail.png"
import storyShelf1 from "../assets/ART/Children's Picture Books/1.png"
import storyShelf2 from "../assets/ART/Children's Picture Books/2.png"
import storyShelf3 from "../assets/ART/Children's Picture Books/3.png"
import storyShelf4 from "../assets/ART/Children's Picture Books/4.png"
import storyShelf5 from "../assets/ART/Children's Picture Books/5.png"
import storyShelf6 from "../assets/ART/Children's Picture Books/6.png"
import storyShelf7 from "../assets/ART/Children's Picture Books/7.png"
import storyShelf8 from "../assets/ART/Children's Picture Books/8.png"
import framesVideo from '../assets/ART/Frames/eyes.MP4'
import kaelVideo from '../assets/DEV/KAEL.mp4'
import { preloadMediaAsset } from '../lib/mediaUtils'
import devImg from '../assets/Notes/dev.png'
import fileImg from '../assets/Collage/File.png'
import uiUxImg from '../assets/Notes/ui_ux.png'
import type { ExpertiseCategory } from '../lib/pageNavigation'

export type ProjectDetailType = 'gallery' | 'case-study'
export type ThumbnailType = 'image' | 'video'

export type PortfolioProject = {
  id: string
  category: ExpertiseCategory
  title: string
  subtitle: string
  thumbnail: string
  thumbnailType?: ThumbnailType
  thumbnailPosition?: string
  detailType?: ProjectDetailType
  gallery: string[]
}

/**
 * Add new portfolio work here — cards and detail pages are generated from this list.
 */
export const PORTFOLIO_PROJECTS: PortfolioProject[] = [
  {
    id: 'after-hours',
    category: 'art',
    title: 'After Hours',
    subtitle: 'Portraits',
    thumbnail: afterHoursThumbnail,
    detailType: 'gallery',
    gallery: [afterHours1, afterHours2, afterHours3, afterHours4, afterHours5, afterHours6, afterHours7],
  },
  {
    id: 'second-skin',
    category: 'art',
    title: 'Second Skin',
    subtitle: 'Character Concepts',
    thumbnail: secondSkinThumbnail,
    detailType: 'gallery',
    gallery: [
      secondSkin1,
      secondSkin2,
      secondSkin3,
      secondSkin4,
      secondSkin5,
      secondSkin6,
      secondSkin7,
    ],
  },
  {
    id: 'archive',
    category: 'art',
    title: 'Archive',
    subtitle: 'Illustrations',
    thumbnail: archiveThumbnail,
    detailType: 'gallery',
    gallery: [archive1, archive2, archive3, archive4, archive5],
  },
  {
    id: 'story-shelf',
    category: 'art',
    title: 'Story Shelf',
    subtitle: "Children's Illustration",
    thumbnail: storyShelfThumbnail,
    detailType: 'gallery',
    gallery: [
      storyShelf1,
      storyShelf2,
      storyShelf3,
      storyShelf4,
      storyShelf5,
      storyShelf6,
      storyShelf7,
      storyShelf8,
    ],
  },
  {
    id: 'frames',
    category: 'art',
    title: 'Frames',
    subtitle: 'Animations',
    thumbnail: framesVideo,
    thumbnailType: 'video',
    detailType: 'gallery',
    gallery: [framesVideo],
  },
  {
    id: 'kael',
    category: 'development',
    title: 'KAEL',
    subtitle: 'AI Portfolio Builder & E-Library',
    thumbnail: kaelVideo,
    thumbnailType: 'video',
    detailType: 'case-study',
    gallery: [],
  },
  {
    id: 'mirve-ui',
    category: 'ui-ux',
    title: 'MIRVÉ',
    subtitle: 'Portfolio UI',
    thumbnail: uiUxImg,
    gallery: [uiUxImg],
  },
  {
    id: 'product-flow',
    category: 'ui-ux',
    title: 'Product Flow',
    subtitle: 'Case Study',
    thumbnail: fileImg,
    gallery: [fileImg],
  },
  {
    id: 'mobile-ui',
    category: 'ui-ux',
    title: 'Mobile UI',
    subtitle: 'Interface',
    thumbnail: uiUxImg,
    gallery: [uiUxImg],
  },
  {
    id: 'frontend',
    category: 'development',
    title: 'Frontend',
    subtitle: 'Architecture',
    thumbnail: devImg,
    gallery: [devImg],
  },
  {
    id: 'portfolio',
    category: 'development',
    title: 'Portfolio',
    subtitle: 'React + Vite',
    thumbnail: fileImg,
    gallery: [fileImg],
  },
]

export function projectsForCategory(category: ExpertiseCategory): PortfolioProject[] {
  return PORTFOLIO_PROJECTS.filter((project) => project.category === category)
}

export function getProjectById(projectId: string): PortfolioProject | undefined {
  return PORTFOLIO_PROJECTS.find((project) => project.id === projectId)
}

export function isProjectOpenable(project: PortfolioProject): boolean {
  return project.detailType === 'gallery' || project.detailType === 'case-study'
}

export function preloadProjectGallery(project: PortfolioProject, eager = false): void {
  if (project.thumbnailType === 'video') {
    preloadMediaAsset(project.thumbnail, eager)
  }

  for (const src of project.gallery) {
    preloadMediaAsset(src, eager)
  }
}
