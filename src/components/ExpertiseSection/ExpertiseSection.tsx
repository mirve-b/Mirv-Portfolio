import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { loadCategoryThumbnails } from '../../data/projectAssets'
import {
  getProjectsMetaForCategory,
  isProjectOpenable,
  isVideoShowcase,
  type PortfolioProjectMeta,
} from '../../data/portfolioProjects'
import { primeVideoFrame, startMutedPreview } from '../../lib/mediaUtils'
import {
  EXPERTISE_TABS,
  type ExpertiseCategory,
} from '../../lib/pageNavigation'
import styles from './ExpertiseSection.module.css'

const cardSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 22,
}

const panelSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
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
  entranceMotionEnabled?: boolean
  hideCards?: boolean
  tabPanelMotionEnabled?: boolean
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

function MediaLoader({ label = 'Loading preview' }: { label?: string }) {
  return (
    <div className={styles.mediaLoader} aria-hidden="true">
      <span className={styles.mediaLoaderSpinner} />
      <span className={styles.mediaLoaderText}>{label}</span>
    </div>
  )
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

function ShowcaseVideoCard({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [showPlayButton, setShowPlayButton] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [frameReady, setFrameReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setFrameReady(false)
    setShowPlayButton(false)
    setIsPaused(true)

    const onFrameReady = () => {
      primeVideoFrame(video)

      if (video.readyState >= 2) {
        setFrameReady(true)
        setShowPlayButton(true)
        return
      }

      void startMutedPreview(video).then(() => {
        video.pause()
        video.currentTime = 0.001
        setFrameReady(true)
        setShowPlayButton(true)
        setIsPaused(true)
      })
    }

    video.addEventListener('loadeddata', onFrameReady, { once: true })
    video.addEventListener('loadedmetadata', () => primeVideoFrame(video), {
      once: true,
    })
    if (video.readyState >= 1) onFrameReady()

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (video.readyState < 2) {
            video.preload = 'auto'
            video.load()
          } else {
            onFrameReady()
          }
          return
        }

        video.pause()
        setIsPaused(true)
        if (video.readyState >= 2) setShowPlayButton(true)
      },
      { threshold: 0.15 },
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
      video.removeEventListener('loadeddata', onFrameReady)
    }
  }, [src])

  const handlePlayButton = useCallback(async (event: MouseEvent) => {
    event.stopPropagation()
    const video = videoRef.current
    if (!video) return

    setShowPlayButton(false)
    video.loop = true
    video.muted = false
    setIsPaused(false)

    try {
      await video.play()
    } catch {
      video.muted = true
      await video.play()
    }
  }, [])

  const handleVideoClick = useCallback(async () => {
    if (showPlayButton) return

    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      setIsPaused(false)
      try {
        await video.play()
      } catch {
        /* playback blocked */
      }
      return
    }

    video.pause()
    setIsPaused(true)
    setShowPlayButton(true)
  }, [showPlayButton])

  return (
    <div className={styles.showcaseVideoWrap}>
      <AnimatePresence>
        {!frameReady ? (
          <motion.div
            key="loader"
            className={styles.showcaseLoaderSlot}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <MediaLoader label="Loading video" />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <video
        ref={videoRef}
        src={src}
        className={styles.showcaseVideo}
        data-ready={frameReady ? 'true' : undefined}
        loop
        muted
        playsInline
        preload="metadata"
        draggable={false}
        onClick={handleVideoClick}
      />
      <AnimatePresence>
        {frameReady && showPlayButton ? (
          <motion.button
            key="play"
            type="button"
            className={styles.showcasePlayButton}
            aria-label="Play video"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.88 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            onClick={handlePlayButton}
          >
            <span className={styles.showcasePlayIcon} aria-hidden="true">
              <svg viewBox="0 0 12 14" fill="none">
                <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
              </svg>
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
      {!showPlayButton && isPaused && frameReady ? (
        <div className={styles.showcasePausedHint} aria-hidden="true" />
      ) : null}
    </div>
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
  const cardMotion = {
    initial: shouldEntrance ? { opacity: 0, y: 28, scale: 0.94 } : false,
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: shouldEntrance
      ? {
          ...cardSpring,
          delay: Math.min(index * 0.06, 0.36),
        }
      : { duration: 0 },
    whileHover: isClickable
      ? {
          y: -10,
          scale: 1.04,
          zIndex: 2,
          transition: { type: 'spring' as const, stiffness: 520, damping: 22 },
        }
      : undefined,
    whileTap: isClickable ? { scale: 0.98 } : undefined,
  }

  const content = (
    <>
      <div
        className={`${styles.cardImageWrap}${
          isShowcase ? ` ${styles.cardImageWrapShowcase}` : ''
        }`}
      >
        {isShowcase && thumbnail ? (
          <ShowcaseVideoCard src={thumbnail} />
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
  entranceMotionEnabled = false,
  hideCards = false,
  tabPanelMotionEnabled = false,
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

  const renderCards = (motionEnabled: boolean) => (
    <div
      className={`${styles.grid}${
        category === 'development' ? ` ${styles.gridDevelopment}` : ''
      }`}
    >
      {projects.map((project, index) => (
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
    </div>
  )

  const cardsVisible =
    !hideCards &&
    !(category === 'development' && thumbnailsLoading && !thumbnailCache.has('development'))

  return (
    <section className={styles.section} aria-label="Expertise portfolio">
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
                tabPanelMotionEnabled ? (
                  <motion.span
                    layoutId="expertise-tab-indicator"
                    className={styles.tabIndicator}
                    transition={tabIndicatorSpring}
                    aria-hidden="true"
                  />
                ) : (
                  <span className={styles.tabIndicator} aria-hidden="true" />
                )
              ) : null}
              <span className={styles.tabLabel}>{label}</span>
            </button>
          )
        })}
      </nav>

      <div
        className={styles.cardsStage}
        data-hidden={hideCards || !cardsVisible ? 'true' : undefined}
      >
        {cardsVisible ? (
          tabPanelMotionEnabled ? (
            <AnimatePresence custom={tabDirection} initial={false}>
              <motion.div
                key={category}
                className={styles.panel}
                custom={tabDirection}
                initial={{ opacity: 0, x: tabDirection > 0 ? 48 : -48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: tabDirection > 0 ? -48 : 48 }}
                transition={panelSpring}
              >
                {renderCards(false)}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div key={category} className={styles.panel}>
              {renderCards(entranceMotionEnabled)}
            </div>
          )
        ) : null}
      </div>
    </section>
  )
}
