import { motion } from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'
import styles from './TaglineDivider.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

export function TaglineDivider() {
  const reduced = useReducedMotion()
  const hidden = reduced ? false : 'hidden'

  return (
    <motion.section
      className={styles.section}
      aria-label="Tagline"
      initial={hidden}
      whileInView="visible"
      viewport={{ once: true, margin: '-20px' }}
    >
      <div className={styles.divider}>
        <motion.span
          className={styles.line}
          style={{ transformOrigin: '100% 50%' }}
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 0.2 } },
          }}
        >
          <motion.span
            className={styles.dot}
            variants={{
              hidden: { scale: 0, y: '-50%' },
              visible: { scale: 1, y: '-50%', transition: { type: 'spring', stiffness: 500, damping: 14, delay: 0.15 } },
            }}
          />
        </motion.span>
        <motion.p
          className={styles.text}
          variants={{
            hidden: { opacity: 0, letterSpacing: '0.3em', filter: 'blur(8px)' },
            visible: {
              opacity: 1,
              letterSpacing: '0.04em',
              filter: 'blur(0px)',
              transition: { duration: 1.2, ease: EASE },
            },
          }}
        >
          Part engineer, part illustrator, entirely curious
        </motion.p>
        <motion.span
          className={styles.line}
          style={{ transformOrigin: '0% 50%' }}
          variants={{
            hidden: { scaleX: 0 },
            visible: { scaleX: 1, transition: { duration: 1.1, ease: EASE, delay: 0.2 } },
          }}
        >
          <motion.span
            className={styles.dot}
            variants={{
              hidden: { scale: 0, y: '-50%' },
              visible: { scale: 1, y: '-50%', transition: { type: 'spring', stiffness: 500, damping: 14, delay: 0.15 } },
            }}
          />
        </motion.span>
      </div>
    </motion.section>
  )
}
