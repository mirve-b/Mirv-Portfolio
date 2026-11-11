import { motion, useScroll, useSpring } from 'framer-motion'
import styles from './ScrollProgress.module.css'

/** Hairline accent bar along the top edge that tracks page scroll. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, mass: 0.4 })

  return <motion.div className={styles.bar} style={{ scaleX }} aria-hidden="true" />
}
