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

const EASE = [0.16, 1, 0.3, 1] as const
const pad = (n: number) => String(n).padStart(2, '0')

/** Fills the last cell when there's an odd number of pieces, so the grid stays whole. */
function NoteCell({ project }: { project: PortfolioProjectMeta }) {
  return (
    <div className={`${styles.cell} ${styles.noteCell}`} aria-hidden="true">
      <span className={styles.cross} />
      <p>
        {project.title} · {project.subtitle}
        <br />
        <span>Mirvé · {new Date().getFullYear()}</span>
      </p>
    </div>
  )
}

/** One feature of the suite: its number, the film, then its name, all in one grid cell. */
function SuiteShowcaseCard({
  project,
  thumbnail,
  loading,
  index,
  total,
}: {
  project: PortfolioProjectMeta
  thumbnail?: string
  loading: boolean
  index: number
  total: number
}) {
  return (
    <motion.article
      className={`${styles.cell} ${styles.showcaseCell}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay: (index % 2) * 0.08 }}
    >
      <p className={styles.cellIndex}>
        {pad(index + 1)} <span>/ {pad(total)}</span>
      </p>
      <div className={styles.film}>
        <span className={styles.corner} data-pos="tl" aria-hidden="true" />
        <span className={styles.corner} data-pos="tr" aria-hidden="true" />
        <span className={styles.corner} data-pos="bl" aria-hidden="true" />
        <span className={styles.corner} data-pos="br" aria-hidden="true" />
        {thumbnail ? (
          <ShowcaseVideoCard poster={thumbnail} projectId={project.id} />
        ) : loading ? (
          <MediaLoader />
        ) : null}
      </div>
      <h3 className={styles.cellTitle}>{project.title}</h3>
      <p className={styles.cellSubtitle}>{project.subtitle}</p>
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
  const placeholderCount = (2 - (showcaseProjects.length % 2)) % 2

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

  const code = `MRV-${project.title.replace(/[^A-Z]/gi, '').slice(0, 3).toUpperCase()}`

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label={`${project.title} showcase`}
    >
      <button type="button" className={styles.backButton} onClick={handleBack}>
        ← Back
      </button>

      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: EASE }}
      >
        {project.title}
      </motion.h1>

      <motion.span
        className={styles.rule}
        aria-hidden="true"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.3, ease: EASE, delay: 0.2 }}
      />
      <header className={styles.specHead}>
        <span className={styles.cross} aria-hidden="true" />
        <span>Development / Suite</span>
        <span className={styles.specMid}>{project.titleMark ?? project.subtitle}</span>
        <span>{code}</span>
        <span className={styles.cross} aria-hidden="true" />
      </header>

      <div className={styles.intro}>
        <p className={styles.subtitle}>{project.subtitle}</p>
        {project.description ? <p className={styles.description}>{project.description}</p> : null}
      </div>

      <div className={styles.showcaseGrid}>
        {showcaseProjects.map((item, index) => (
          <SuiteShowcaseCard
            key={item.id}
            project={item}
            thumbnail={thumbnails[item.id]}
            loading={thumbnailsLoading}
            index={index}
            total={showcaseProjects.length}
          />
        ))}
        {placeholderCount ? <NoteCell project={project} /> : null}
      </div>
    </section>
  )
}
