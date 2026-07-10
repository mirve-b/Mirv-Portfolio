import { motion } from 'framer-motion'
import { staggerContainer } from '../../lib/motion'
import { EXPERTISE_HEADINGS, TOOLBOX } from './skillsData'
import { ToolIcon } from './ToolIcons'
import styles from './SkillsPanel.module.css'

const springBounce = { type: 'spring' as const, stiffness: 420, damping: 14 }

const fadeItem = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springBounce,
  },
}

export function SkillsPanel() {
  return (
    <motion.div
      className={styles.panel}
      variants={staggerContainer(0.07)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      aria-label="Expertise and toolbox"
    >
      <motion.div className={styles.block} variants={fadeItem}>
        <h3 className={styles.sectionLabel}>Expertise</h3>

        <ul className={styles.expertiseList}>
          {EXPERTISE_HEADINGS.map((heading) => (
            <li key={heading}>
              <motion.span
                className={styles.expertiseHeading}
                whileHover={{ x: 4 }}
                transition={springBounce}
              >
                {heading}
              </motion.span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div className={styles.block} variants={fadeItem}>
        <h3 className={styles.sectionLabel}>Toolbox</h3>

        <ul className={styles.toolList}>
          {TOOLBOX.map((tool) => (
            <li key={tool.id} className={styles.toolItem}>
              <motion.span
                className={styles.toolWrap}
                aria-label={tool.label}
                whileHover={{ scale: 1.12, y: -4, rotate: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={springBounce}
              >
                <span className={styles.toolIcon}>
                  <ToolIcon id={tool.id} />
                </span>
                <span className={styles.toolBubble} role="tooltip">
                  {tool.label}
                </span>
              </motion.span>
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}
