import { useCallback } from 'react'
import type { PortfolioProjectMeta } from '../../data/portfolioProjects'
import { getArtSuiteProjects } from '../../data/portfolioProjects'
import starBottomLeft from '../../assets/ART/TOY BOX/Vector 17.png'
import starTopRight from '../../assets/ART/TOY BOX/Vector 18.png'
import circleLeft from '../../assets/ART/TOY BOX/Ellipse 17.png'
import circleRight from '../../assets/ART/TOY BOX/Ellipse 18.png'
import styles from './ToyBoxSuiteView.module.css'

type ToyBoxSuiteViewProps = {
  project: PortfolioProjectMeta
  onBack: () => void
  onOpenProject: (projectId: string) => void
}

export function ToyBoxSuiteView({
  project,
  onBack,
  onOpenProject,
}: ToyBoxSuiteViewProps) {
  const suiteProjects = getArtSuiteProjects(project.id)

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

      <div className={styles.stage}>
        <img
          src={starBottomLeft}
          alt=""
          className={`${styles.deco} ${styles.decoStarBottomLeft}`}
          draggable={false}
          aria-hidden="true"
        />
        <img
          src={starTopRight}
          alt=""
          className={`${styles.deco} ${styles.decoStarTopRight}`}
          draggable={false}
          aria-hidden="true"
        />
        <img
          src={circleLeft}
          alt=""
          className={`${styles.deco} ${styles.decoCircleLeft}`}
          draggable={false}
          aria-hidden="true"
        />
        <img
          src={circleRight}
          alt=""
          className={`${styles.deco} ${styles.decoCircleRight}`}
          draggable={false}
          aria-hidden="true"
        />

        <div className={styles.cardRow}>
          {suiteProjects.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.suiteCard}
              onClick={() => onOpenProject(item.id)}
            >
              <span className={styles.suiteCardFrame}>
                <span className={styles.suiteCardTitle}>{item.title}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
