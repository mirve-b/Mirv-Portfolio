import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  projectsForCategory,
  isProjectOpenable,
  preloadProjectGalleryProgressive,
  preloadProjectOnHover,
} from '../../data/portfolioProjects'
import { startMutedPreview } from '../../lib/mediaUtils'
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
  motionEnabled?: boolean
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
      preload="metadata"
      draggable={false}
    />
  )
}

function ProjectCard({
  project,
  index,
  onOpenProject,
  motionEnabled,
}: {
  project: ReturnType<typeof projectsForCategory>[number]
  index: number
  onOpenProject: (projectId: string) => void
  motionEnabled: boolean
}) {
  const isClickable = isProjectOpenable(project)
  const isVideo = project.thumbnailType === 'video'
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
      <div className={styles.cardImageWrap}>
        {isVideo ? (
          <CardVideo src={project.thumbnail} />
        ) : (
          <img
            src={project.thumbnail}
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
        )}
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
        onPointerEnter={() => preloadProjectOnHover(project)}
        onClick={() => {
          onOpenProject(project.id)
          const preload = () => preloadProjectGalleryProgressive(project)
          if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(preload, { timeout: 1200 })
          } else {
            window.setTimeout(preload, 0)
          }
        }}
      >
        {content}
      </motion.button>
    )
  }

  return (
    <motion.article className={`${styles.card} ${styles.cardStatic}`} {...cardMotion}>
      {content}
    </motion.article>
  )
}

export function ExpertiseSection({
  category,
  onCategoryChange,
  onOpenProject,
  tabDirection,
  motionEnabled = true,
}: ExpertiseSectionProps) {
  const projects = projectsForCategory(category)

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

      <div className={styles.cardsStage}>
        <AnimatePresence custom={tabDirection} initial={false}>
          <motion.div
            key={category}
            className={styles.panel}
            custom={tabDirection}
            initial={
              motionEnabled
                ? { opacity: 0, x: tabDirection > 0 ? 48 : -48 }
                : false
            }
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
                  index={index}
                  onOpenProject={onOpenProject}
                  motionEnabled={motionEnabled}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
