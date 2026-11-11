import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'
import styles from './NameMarquee.module.css'

const ITEMS = Array.from({ length: 24 }, () => 'MIRVÉ')
/** Base drift in % of one content copy per second (≈ the old 48s loop). */
const BASE_SPEED = 100 / 48

/**
 * Infinite name ticker that speeds up, flips direction and leans with scroll
 * velocity, then eases back to its idle drift.
 */
export function NameMarquee() {
  const reduced = useReducedMotion()
  const offset = useMotionValue(0)
  const direction = useRef(1)

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const boost = useTransform(smoothVelocity, [-2000, 0, 2000], [-6, 0, 6], { clamp: false })
  const skewX = useTransform(smoothVelocity, [-2500, 0, 2500], [12, 0, -12])

  useAnimationFrame((_, delta) => {
    if (reduced) return
    const b = boost.get()
    if (b < -0.01) direction.current = -1
    else if (b > 0.01) direction.current = 1

    let move = direction.current * BASE_SPEED * (delta / 1000)
    move += direction.current * Math.abs(b) * BASE_SPEED * (delta / 1000)

    // wrap within one copy's width (the track holds two copies → -50% of track)
    let next = offset.get() - move
    if (next <= -100) next += 100
    if (next > 0) next -= 100
    offset.set(next)
  })

  const x = useTransform(offset, (v) => `${v / 2}%`)

  const renderCopy = (prefix: string) => (
    <div className={styles.content} aria-hidden="true">
      {ITEMS.map((word, index) => (
        <span key={`${prefix}-${index}`} className={styles.word}>
          {word}
        </span>
      ))}
    </div>
  )

  return (
    <section className={styles.section} aria-hidden="true">
      <motion.div className={styles.track} style={reduced ? undefined : { x, skewX }}>
        {renderCopy('a')}
        {renderCopy('b')}
      </motion.div>
    </section>
  )
}
