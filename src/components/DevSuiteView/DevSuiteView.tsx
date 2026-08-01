import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { loadCategoryThumbnails } from '../../data/projectAssets'
import {
  getDevSuiteShowcaseProjects,
  type PortfolioProjectMeta,
} from '../../data/portfolioProjects'
import { MediaLoader, ShowcaseVideoCard } from '../ExpertiseSection/ShowcaseVideoCard'
import styles from './DevSuiteView.module.css'

type DevSuiteViewProps = {
  project: PortfolioProjectMeta
  onBack: () => void
}

function SuiteShowcaseCard({
  project,
  thumbnail,
  loading,
}: {
  project: PortfolioProjectMeta
  thumbnail?: string
  loading: boolean
}) {
  return (
    <motion.article
      className={`${styles.showcaseCard} ${styles.cardShowcase}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      <div className={`${styles.cardImageWrap} ${styles.cardImageWrapShowcase}`}>
        {thumbnail ? (
          <ShowcaseVideoCard poster={thumbnail} projectId={project.id} />
        ) : loading ? (
          <MediaLoader />
        ) : null}
      </div>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardSubtitle}>{project.subtitle}</p>
    </motion.article>
  )
}

function pauseSuiteVideos(root: HTMLElement | null) {
  root?.querySelectorAll('video').forEach((video) => {
    video.pause()
  })
}

export function DevSuiteView({ project, onBack }: DevSuiteViewProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const showcaseProjects = getDevSuiteShowcaseProjects(project.id)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setThumbnailsLoading(true)

    void loadCategoryThumbnails('development').then((next) => {
      if (cancelled) return
      setThumbnails(next)
      setThumbnailsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [project.id])

  const handleBack = useCallback(() => {
    pauseSuiteVideos(sectionRef.current)
    onBack()
  }, [onBack])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label={`${project.title} showcase`}
    >
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <div className={styles.titles}>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.subtitle}>{project.subtitle}</p>
          {project.description ? (
            <p className={styles.description}>{project.description}</p>
          ) : null}
        </div>
      </div>

      <div className={styles.scrollColumn}>
        {showcaseProjects.map((item) => (
          <SuiteShowcaseCard
            key={item.id}
            project={item}
            thumbnail={thumbnails[item.id]}
            loading={thumbnailsLoading}
          />
        ))}
      </div>
    </section>
  )
}
