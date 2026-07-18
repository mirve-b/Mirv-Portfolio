import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { loadCategoryThumbnails, loadProjectShowcaseVideo } from '../../data/projectAssets'
import {
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
import styles from './ExpertiseSection.module.css'

const cardSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 22,
}

const cardHoverSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 0.9,
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

function ShowcaseVideoCard({
  poster,
  projectId,
}: {
  poster: string
  projectId: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const loadedVideoSrcRef = useRef<string | null>(null)
  const [videoSrc, setVideoSrc] = useState<string>()
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoActive, setVideoActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const showPlayButton = !videoLoading && !isPlaying

  useEffect(() => {
    let cancelled = false

    void loadProjectShowcaseVideo(projectId).then((src) => {
      if (!cancelled && src) setVideoSrc(src)
    })

    return () => {
      cancelled = true
    }
  }, [projectId, poster])

  useEffect(() => {
    setVideoLoading(false)
    setVideoActive(false)
    setIsPlaying(false)
    loadedVideoSrcRef.current = null
  }, [poster, projectId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoActive) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [videoActive])

  const handlePlayButton = useCallback(
    async (event: MouseEvent) => {
      event.stopPropagation()
      const video = videoRef.current
      if (!video) return

      setVideoLoading(true)

      if (videoActive && video.paused && loadedVideoSrcRef.current) {
        try {
          await video.play()
          setIsPlaying(true)
        } catch {
          /* playback blocked */
        } finally {
          setVideoLoading(false)
        }
        return
      }

      let src = videoSrc
      if (!src) {
        src = await loadProjectShowcaseVideo(projectId)
        if (!src) {
          setVideoLoading(false)
          return
        }
        setVideoSrc(src)
      }

      const startPlayback = async () => {
        video.loop = true
        video.muted = false

        try {
          await video.play()
        } catch {
          video.muted = true
          await video.play()
        }

        setVideoActive(true)
        setIsPlaying(true)
        setVideoLoading(false)
      }

      try {
        if (loadedVideoSrcRef.current !== src) {
          loadedVideoSrcRef.current = src
          video.src = src
          video.preload = 'auto'

          await new Promise<void>((resolve, reject) => {
            const onReady = () => {
              cleanup()
              resolve()
            }
            const onError = () => {
              cleanup()
              reject(new Error('Video failed to load'))
            }
            const cleanup = () => {
              video.removeEventListener('canplay', onReady)
              video.removeEventListener('error', onError)
            }

            video.addEventListener('canplay', onReady, { once: true })
            video.addEventListener('error', onError, { once: true })
            video.load()
          })
        } else if (video.readyState < 3) {
          await new Promise<void>((resolve, reject) => {
            const onReady = () => {
              cleanup()
              resolve()
            }
            const onError = () => {
              cleanup()
              reject(new Error('Video failed to load'))
            }
            const cleanup = () => {
              video.removeEventListener('canplay', onReady)
              video.removeEventListener('error', onError)
            }

            video.addEventListener('canplay', onReady, { once: true })
            video.addEventListener('error', onError, { once: true })
          })
        }

        await startPlayback()
      } catch {
        setVideoLoading(false)
      }
    },
    [projectId, videoActive, videoSrc],
  )

  const handleVideoClick = useCallback(async () => {
    if (!videoActive || videoLoading || showPlayButton) return

    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      try {
        await video.play()
        setIsPlaying(true)
      } catch {
        /* playback blocked */
      }
      return
    }

    video.pause()
    setIsPlaying(false)
  }, [showPlayButton, videoActive, videoLoading])

  return (
    <div className={styles.showcaseVideoWrap}>
      {videoLoading ? (
        <div className={styles.showcaseLoaderSlot}>
          <MediaLoader label="Loading video" />
        </div>
      ) : null}
      {!videoActive ? (
        <img
          src={poster}
          alt=""
          className={styles.showcasePoster}
          draggable={false}
          decoding="async"
        />
      ) : null}
      <video
        ref={videoRef}
        className={styles.showcaseVideo}
        data-ready={poster ? 'true' : undefined}
        data-active={videoActive ? 'true' : undefined}
        loop
        muted
        playsInline
        preload="none"
        draggable={false}
        onClick={handleVideoClick}
      />
      {showPlayButton ? (
        <button
          type="button"
          className={styles.showcasePlayButton}
          aria-label="Play video"
          onClick={handlePlayButton}
        >
          <span className={styles.showcasePlayIcon} aria-hidden="true">
            <svg viewBox="0 0 12 14" fill="none">
              <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
            </svg>
          </span>
        </button>
      ) : null}
      {videoActive && isPlaying && !videoLoading ? (
        <div className={styles.showcasePausedHint} aria-hidden="true" />
      ) : null}
    </div>
  )
}

function GridPlaceholder({ development = false }: { development?: boolean }) {
  return (
    <div
      className={`${styles.cardPlaceholder}${
        development ? ` ${styles.cardPlaceholderDevelopment}` : ''
      }`}
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

  const entranceDelay = Math.min(index * 0.06, 0.36)
  const cardMotion = {
    initial: shouldEntrance ? { opacity: 0, y: 28, scale: 0.94 } : false,
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      opacity: shouldEntrance
        ? { ...cardSpring, delay: entranceDelay }
        : { duration: 0 },
      y: cardHoverSpring,
      scale: cardHoverSpring,
    },
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

  const renderCards = (motionEnabled: boolean) => {
    const visibleProjects =
      category === 'ui-ux'
        ? projects.filter((project) => project.id === 'blvck' || project.id === 'doubleu')
        : projects

    const placeholderCount =
      category === 'ui-ux'
        ? 1
        : category === 'development'
          ? (2 - (visibleProjects.length % 2)) % 2
          : 0

    return (
      <div
        className={`${styles.grid}${
          category === 'development' ? ` ${styles.gridDevelopment}` : ''
        }`}
      >
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
            development={category === 'development'}
          />
        ))}
      </div>
    )
  }

  const cardsVisible = !hideCards

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
