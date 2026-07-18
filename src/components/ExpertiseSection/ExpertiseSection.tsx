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

const panelTween = {
  type: 'tween' as const,
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1] as const,
}

const cardTween = {
  type: 'tween' as const,
  duration: 0.3,
  ease: [0.22, 1, 0.36, 1] as const,
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
  tabPanelMotionEnabled?: boolean
}

const thumbnailCache = new Map<ExpertiseCategory, Record<string, string>>()

function useCategoryThumbnails(category: ExpertiseCategory) {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(
    () => thumbnailCache.get(category) ?? {},
  )
  const requestId = useRef(0)

  useEffect(() => {
    const cached = thumbnailCache.get(category)
    if (cached) {
      setThumbnails(cached)
      return
    }

    const currentRequest = ++requestId.current

    loadCategoryThumbnails(category)
      .then((next) => {
        if (requestId.current !== currentRequest) return
        thumbnailCache.set(category, next)
        setThumbnails(next)
      })
      .catch(() => {
        if (requestId.current !== currentRequest) return
      })
  }, [category])

  return thumbnails
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
  const [showPlayButton, setShowPlayButton] = useState(true)
  const [isPaused, setIsPaused] = useState(true)
  const [frameReady, setFrameReady] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setFrameReady(false)
    setShowPlayButton(true)
    setIsPaused(true)

    const onFrameReady = () => {
      primeVideoFrame(video)

      if (video.readyState >= 2) {
        setFrameReady(true)
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
        setShowPlayButton(true)
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
      {!showPlayButton && isPaused ? (
        <div className={styles.showcasePausedHint} aria-hidden="true" />
      ) : null}
    </div>
  )
}

function ProjectCard({
  project,
  thumbnail,
  index,
  onOpenProject,
  motionEnabled,
}: {
  project: PortfolioProjectMeta
  thumbnail?: string
  index: number
  onOpenProject: (projectId: string) => void
  motionEnabled: boolean
}) {
  const isClickable = isProjectOpenable(project)
  const isShowcase = isVideoShowcase(project)
  const isVideo = project.thumbnailType === 'video' && Boolean(thumbnail) && !isShowcase
  const cardMotion = motionEnabled
    ? {
        initial: { opacity: 0, y: 16, scale: 0.96 },
        animate: { opacity: 1, y: 0, scale: 1 },
        transition: { ...cardTween, delay: Math.min(index * 0.04, 0.16) },
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
    : {
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
        ) : null}
      </div>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardSubtitle}>{project.subtitle}</p>
    </>
  )

  if (!motionEnabled) {
    if (isClickable) {
      return (
        <button
          type="button"
          className={styles.card}
          onClick={() => onOpenProject(project.id)}
        >
          {content}
        </button>
      )
    }

    return (
      <article
        className={`${styles.card} ${styles.cardStatic}${
          isShowcase ? ` ${styles.cardShowcase}` : ''
        }`}
      >
        {content}
      </article>
    )
  }

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
  tabPanelMotionEnabled = false,
}: ExpertiseSectionProps) {
  const projects = getProjectsMetaForCategory(category)
  const thumbnails = useCategoryThumbnails(category)

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

      <div className={styles.cardsStage}>
        {tabPanelMotionEnabled ? (
          <AnimatePresence custom={tabDirection} initial={false}>
            <motion.div
              key={category}
              className={styles.panel}
              custom={tabDirection}
              initial={{ opacity: 0, x: tabDirection > 0 ? 48 : -48 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: tabDirection > 0 ? -48 : 48 }}
              transition={panelTween}
            >
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
                    index={index}
                    onOpenProject={onOpenProject}
                    motionEnabled={entranceMotionEnabled}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div key={category} className={styles.panel}>
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
                  index={index}
                  onOpenProject={onOpenProject}
                  motionEnabled={entranceMotionEnabled}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
