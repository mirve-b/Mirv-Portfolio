import { motion } from 'framer-motion'
import type { PortfolioProject } from '../../data/portfolioProjects'
import { getCaseStudyForProject } from '../../data/projectCaseStudies'
import styles from './ProjectCaseStudy.module.css'

const sectionSpring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 30,
}

type ProjectCaseStudyProps = {
  project: PortfolioProject
  onBack: () => void
}

export function ProjectCaseStudy({ project, onBack }: ProjectCaseStudyProps) {
  const caseStudy = getCaseStudyForProject(project.id)

  if (!caseStudy) {
    return null
  }

  return (
    <section className={styles.section} aria-label={`${project.title} case study`}>
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={onBack}>
          ← Back
        </button>
        <div className={styles.titles}>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.subtitle}>{project.subtitle}</p>
        </div>
      </div>

      <div className={styles.content}>
        {caseStudy.sections.map((section, index) => (
          <motion.article
            key={section.id}
            className={styles.block}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...sectionSpring, delay: index * 0.04 }}
          >
            <h2 className={styles.blockTitle}>{section.title}</h2>

            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}

            {section.flow ? (
              <ol className={styles.flow}>
                {section.flow.map((step) => (
                  <li key={step} className={styles.flowStep}>
                    {step}
                  </li>
                ))}
              </ol>
            ) : null}

            {section.bullets ? (
              <ul className={styles.bullets}>
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}

            {section.image ? (
              <figure className={styles.figure}>
                <img
                  src={section.image}
                  alt={section.imageCaption ?? ''}
                  className={styles.figureImage}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                />
                {section.imageCaption ? (
                  <figcaption className={styles.figureCaption}>
                    {section.imageCaption}
                  </figcaption>
                ) : null}
              </figure>
            ) : null}
          </motion.article>
        ))}

        <motion.article
          className={styles.block}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...sectionSpring, delay: caseStudy.sections.length * 0.04 }}
        >
          <h2 className={styles.blockTitle}>Technologies Used</h2>
          <ul className={styles.techList}>
            {caseStudy.technologies.map((tech) => (
              <li key={tech} className={styles.techTag}>
                {tech}
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article
          className={styles.block}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            ...sectionSpring,
            delay: (caseStudy.sections.length + 1) * 0.04,
          }}
        >
          <h2 className={styles.blockTitle}>Future Scope</h2>
          <ul className={styles.bullets}>
            {caseStudy.futureScope.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </motion.article>
      </div>
    </section>
  )
}
