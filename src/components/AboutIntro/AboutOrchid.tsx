import { motion, useTransform, type MotionValue } from 'framer-motion'
import orchidImg from '../../assets/Collage/orchid1.webp'
import styles from './AboutOrchid.module.css'

/**
 * ABOUT ORCHID: the orchid branch on the right of the About text, its stem meeting the
 * window's right edge. As the section scrolls in (`progress` 0 → 1) it drifts in from the
 * right, turns a little and fades up. Position and size live in AboutOrchid.module.css.
 */
export function AboutOrchid({ progress }: { progress: MotionValue<number> }) {
  const x = useTransform(progress, [0, 1], ['22%', '0%'])
  const rotate = useTransform(progress, [0, 1], [-62, -74])
  const opacity = useTransform(progress, [0.1, 0.5], [0, 1])

  return (
    <motion.img
      className={styles.orchid}
      src={orchidImg}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      style={{ x, rotate, opacity }}
    />
  )
}
