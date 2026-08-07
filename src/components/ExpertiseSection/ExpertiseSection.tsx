import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { loadCategoryThumbnails } from '../../data/projectAssets'
import { getDevSuiteMedia } from '../../data/devSuites'
import {
  getDevTabProjects,
  getProjectsMetaForCategory,
  isProjectOpenable,
  isVideoShowcase,
  type PortfolioProjectMeta,
} from '../../data/portfolioProjects'
import { startMutedPreview } from '../../lib/mediaUtils'
import {
  EXPERTISE_TABS,
  type ExpertiseCategory,
} from '../../lib/pageNavigation'
import { DevSuitePreviewVideo } from '../DevSuiteView/DevSuitePreviewVideo'
import { MediaLoader, ShowcaseVideoCard } from './ShowcaseVideoCard'
import styles from './ExpertiseSection.module.css'

const cardSpring = {
  type: 'spring' as const,
  stiffness: 340,
  damping: 26,
  mass: 0.85,
}

const cardHoverSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 0.9,
}

const tabPanelSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 30,
  mass: 0.9,
}

const tabIndicatorSpring = {
  type: 'spring' as const,
  stiffness: 480,
  damping: 36,
}

type ExpertiseSectionProps = {
  category: ExpertiseCategory
  onCategoryChange: (category: ExpertiseCategory) => void
  onOpenProject: (projectId: string) => void
  tabDirection: number
  hideCards?: boolean
}

const thumbnailCache = new Map<ExpertiseCategory, Record<string, string>>()

function useCategoryThumbnails(category: ExpertiseCategory) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(
    () => thumbnailCache.get(category) ?? {},
  )
  const [loading, setLoading] = useState(
    () => !thumbnailCache.has(category),
  )
  const requestId = useRef(0)

  useEffect(() => {
    const cached = thumbnailCache.get(category)
    if (cached) {
      setThumbnails(cached)
      setLoading(false)
      return
    }

    const currentRequest = ++requestId.current
    setLoading(true)

    loadCategoryThumbnails(category)
      .then((next) => {
        if (requestId.current !== currentRequest) return
        thumbnailCache.set(category, next)
        setThumbnails(next)
      })
      .catch(() => {
        if (requestId.current !== currentRequest) return
      })
      .finally(() => {
        if (requestId.current !== currentRequest) return
        setLoading(false)
      })
  }, [category])

  return { thumbnails, loading }
}

function CardVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void startMutedPreview(video)
          return
        }
        video.pause()
      },
      { threshold: 0.15 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      className={styles.cardVideo}
      loop
      muted
      playsInline
      preload="none"
      draggable={false}
    />
  )
}

function DevSuiteMainCard({
  project,
  index,
  motionEnabled,
  onOpenProject,
}: {
  project: PortfolioProjectMeta
  index: number
  motionEnabled: boolean
  onOpenProject: (projectId: string) => void
}) {
  const [shouldEntrance] = useState(motionEnabled)
  const media = getDevSuiteMedia(project.id)
  const entranceDelay = Math.min(index * 0.07, 0.28)

  return (
    <motion.article
      className={styles.devSuiteCard}
      initial={shouldEntrance ? { opacity: 0, y: 18, scale: 0.985 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        shouldEntrance
          ? { ...cardSpring, delay: entranceDelay }
          : { duration: 0 }
      }
    >
      {media?.previewVideoSrc ? (
        <div className={styles.devSuiteMedia}>
          <DevSuitePreviewVideo src={media.previewVideoSrc} fillCard />
        </div>
      ) : (
        <div className={`${styles.devSuiteMedia} ${styles.devSuiteVideoFallback}`}>
          <MediaLoader />
        </div>
      )}
      <div className={styles.devSuiteCopy}>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardSubtitle}>{project.subtitle}</p>
        {project.description ? (
          <p className={styles.devSuiteDescription}>{project.description}</p>
        ) : null}
        {project.techStack && project.techStack.length > 0 ? (
          <ul className={styles.devSuiteTechStack} aria-label="Tech stack">
            {project.techStack.map((item) => (
              <li key={item}>
                <motion.span
                  className={styles.devSuiteTechChip}
                  whileHover={{ scale: 1.08, y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  transition={cardHoverSpring}
                >
                  {item}
                </motion.span>
              </li>
            ))}
          </ul>
        ) : null}
        <motion.button
          type="button"
          className={styles.devSuiteExplore}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={cardHoverSpring}
          onClick={() => onOpenProject(project.id)}
        >
          Explore
        </motion.button>
      </div>
    </motion.article>
  )
}

function GridPlaceholder({
  development = false,
  strokeOnly = false,
}: {
  development?: boolean
  strokeOnly?: boolean
}) {
  return (
    <div
      className={`${styles.cardPlaceholder}${
        development ? ` ${styles.cardPlaceholderDevelopment}` : ''
      }${strokeOnly ? ` ${styles.cardPlaceholderStroke}` : ''}`}
      aria-hidden="true"
    />
  )
}

function ProjectCard({
  project,
  thumbnail,
  thumbnailsLoading,
  index,
  onOpenProject,
  motionEnabled,
}: {
  project: PortfolioProjectMeta
  thumbnail?: string
  thumbnailsLoading: boolean
  index: number
  onOpenProject: (projectId: string) => void
  motionEnabled: boolean
}) {
  const [shouldEntrance] = useState(motionEnabled)
  const isClickable = isProjectOpenable(project)
  const isShowcase = isVideoShowcase(project)
  const isVideo = project.thumbnailType === 'video' && Boolean(thumbnail) && !isShowcase
  const expectsMedia =
    project.thumbnailType === 'video' || isShowcase || Boolean(thumbnail)
  const mediaPending = thumbnailsLoading || (expectsMedia && !thumbnail)

  const entranceDelay = Math.min(index * 0.055, 0.3)
  const cardMotion = {
    initial: shouldEntrance ? { opacity: 0, y: 16, scale: 0.97 } : false,
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: shouldEntrance
      ? {
          ...cardSpring,
          delay: entranceDelay,
          opacity: { ...cardSpring, delay: entranceDelay },
        }
      : { duration: 0 },
    whileHover: isClickable
      ? {
          y: -10,
          scale: 1.04,
          zIndex: 2,
          transition: cardHoverSpring,
        }
      : undefined,
    whileTap: isClickable ? { scale: 0.98, transition: cardHoverSpring } : undefined,
  }

  const content = (
    <>
      <div
        className={`${styles.cardImageWrap}${
          isShowcase ? ` ${styles.cardImageWrapShowcase}` : ''
        }`}
      >
        {isShowcase && thumbnail ? (
          <ShowcaseVideoCard poster={thumbnail} projectId={project.id} />
        ) : isVideo && thumbnail ? (
          <CardVideo src={thumbnail} />
        ) : thumbnail ? (
          <img
            src={thumbnail}
            alt=""
            className={styles.cardImage}
            style={
              project.thumbnailPosition
                ? { objectPosition: project.thumbnailPosition }
                : undefined
            }
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        ) : mediaPending ? (
          <MediaLoader />
        ) : null}
      </div>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardSubtitle}>{project.subtitle}</p>
    </>
  )

  if (isClickable) {
    return (
      <motion.button
        type="button"
        className={styles.card}
        {...cardMotion}
        onClick={() => onOpenProject(project.id)}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <motion.article
      className={`${styles.card} ${styles.cardStatic}${
        isShowcase ? ` ${styles.cardShowcase}` : ''
      }`}
      {...cardMotion}
    >
      {content}
    </motion.article>
  )
}

export function ExpertiseSection({
  category,
  onCategoryChange,
  onOpenProject,
  tabDirection,
  hideCards = false,
}: ExpertiseSectionProps) {
  const projects = getProjectsMetaForCategory(category)
  const { thumbnails, loading: thumbnailsLoading } = useCategoryThumbnails(category)

  useEffect(() => {
    if (category === 'development') return
    if (thumbnailCache.has('development')) return

    loadCategoryThumbnails('development').then((next) => {
      thumbnailCache.set('development', next)
    })
  }, [category])

  const renderCards = (motionEnabled: boolean) => {
    if (category === 'development') {
      const devSuites = getDevTabProjects()

      return (
        <div className={styles.devColumn}>
          {devSuites.map((project, index) => (
            <DevSuiteMainCard
              key={project.id}
              project={project}
              index={index}
              motionEnabled={motionEnabled}
              onOpenProject={onOpenProject}
            />
          ))}
        </div>
      )
    }

    const visibleProjects =
      category === 'ui-ux'
        ? projects.filter((project) => project.id === 'blvck' || project.id === 'doubleu')
        : projects

    const placeholderCount =
      category === 'ui-ux' ? 1 : category === 'art' ? 2 : 0

    return (
      <div className={styles.grid}>
        {visibleProjects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            thumbnail={thumbnails[project.id]}
            thumbnailsLoading={thumbnailsLoading}
            index={index}
            onOpenProject={onOpenProject}
            motionEnabled={motionEnabled}
          />
        ))}
        {Array.from({ length: placeholderCount }, (_, index) => (
          <GridPlaceholder
            key={`placeholder-${index}`}
            strokeOnly={category === 'art'}
          />
        ))}
      </div>
    )
  }

  const cardsVisible = !hideCards

  return (
    <section className={styles.section} aria-label="Expertise portfolio">
      <LayoutGroup id="expertise-tab-bar">
        <nav className={styles.tabBar} aria-label="Expertise categories">
          {EXPERTISE_TABS.map(({ id, label }) => {
            const isActive = category === id

            return (
              <button
                key={id}
                type="button"
                className={`${styles.tab}${isActive ? ` ${styles.tabActive}` : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onCategoryChange(id)}
              >
                {isActive ? (
                  <motion.span
                    layoutId="expertise-tab-indicator"
                    className={styles.tabIndicator}
                    transition={tabIndicatorSpring}
                    aria-hidden="true"
                  />
                ) : null}
                <span className={styles.tabLabel}>{label}</span>
              </button>
            )
          })}
        </nav>
      </LayoutGroup>

      <div
        className={styles.cardsStage}
        data-hidden={hideCards || !cardsVisible ? 'true' : undefined}
      >
        {cardsVisible ? (
          <AnimatePresence mode="wait" custom={tabDirection} initial={false}>
            <motion.div
              key={category}
              className={styles.panel}
              custom={tabDirection}
              initial={{
                opacity: 0,
                y: 14,
                x: tabDirection > 0 ? 18 : -18,
              }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{
                opacity: 0,
                y: -10,
                x: tabDirection > 0 ? -14 : 14,
              }}
              transition={tabPanelSpring}
            >
              {renderCards(true)}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </section>
  )
}
