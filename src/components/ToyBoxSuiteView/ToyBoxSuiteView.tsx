import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { loadProjectThumbnail } from '../../data/projectAssets'
import type { PortfolioProjectMeta } from '../../data/portfolioProjects'
import { getArtSuiteProjects } from '../../data/portfolioProjects'
import cardStyles from '../ExpertiseSection/ExpertiseSection.module.css'
import styles from './ToyBoxSuiteView.module.css'

type ToyBoxSuiteViewProps = {
  project: PortfolioProjectMeta
  onBack: () => void
  onOpenProject: (projectId: string) => void
}

const cardHoverSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
  mass: 0.9,
}

export function ToyBoxSuiteView({
  project,
  onBack,
  onOpenProject,
}: ToyBoxSuiteViewProps) {
  const suiteProjects = getArtSuiteProjects(project.id)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const [thumbnailsLoading, setThumbnailsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const items = getArtSuiteProjects(project.id)
    setThumbnailsLoading(true)

    void Promise.all(
      items.map(async (item) => {
        const thumbnail = await loadProjectThumbnail(item.id)
        return [item.id, thumbnail] as const
      }),
    ).then((entries) => {
      if (cancelled) return
      setThumbnails(Object.fromEntries(entries))
      setThumbnailsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [project.id])

  const handleBack = useCallback(() => {
    onBack()
  }, [onBack])

  return (
    <section className={styles.section} aria-label={`${project.title} suite`}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <div className={styles.titles}>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.subtitle}>{project.subtitle}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {suiteProjects.map((item, index) => {
          const thumbnail = thumbnails[item.id]
          const mediaPending = thumbnailsLoading || !thumbnail

          return (
            <motion.button
              key={item.id}
              type="button"
              className={cardStyles.card}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 340,
                damping: 26,
                mass: 0.85,
                delay: Math.min(index * 0.055, 0.3),
              }}
              whileHover={{
                y: -10,
                scale: 1.04,
                zIndex: 2,
                transition: cardHoverSpring,
              }}
              whileTap={{ scale: 0.98, transition: cardHoverSpring }}
              onClick={() => onOpenProject(item.id)}
            >
              <div className={cardStyles.cardImageWrap}>
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt=""
                    className={cardStyles.cardImage}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                  />
                ) : mediaPending ? (
                  <div className={cardStyles.mediaLoader} aria-hidden="true">
                    <div className={cardStyles.mediaLoaderSpinner} />
                    <span className={cardStyles.mediaLoaderText}>Loading</span>
                  </div>
                ) : null}
              </div>
              <h3 className={cardStyles.cardTitle}>{item.title}</h3>
              <p className={cardStyles.cardSubtitle}>{item.subtitle}</p>
            </motion.button>
          )
        })}
      </div>
    </section>
  )
}
