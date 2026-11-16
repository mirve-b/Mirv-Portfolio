import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'
import styles from './NameMarquee.module.css'

/** One dot tile, in px. The pattern loops every tile, so the drift wraps seamlessly. */
const TILE = 26
/** Idle drift of the dots, px per second. */
const DOT_SPEED = 18
/** Idle drift of the name, % of one copy per second. */
const NAME_SPEED = 100 / 60
const NAMES = Array.from({ length: 16 }, () => 'MIRVÉ')

/**
 * Two strips of tape crossing the page: cream polka dots, and a black one printed with the
 * name. Both drift in opposite directions, speed up and flip with scroll, then settle back.
 */
export function NameMarquee() {
  const reduced = useReducedMotion()
  const dots = useMotionValue(0)
  const name = useMotionValue(0)
  const direction = useRef(1)
  // only animate while the tapes are on screen
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { margin: '200px 0px' })

  const { scrollY } = useScroll()
  const scrollVelocity = useVelocity(scrollY)
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 })
  const boost = useTransform(smoothVelocity, [-2000, 0, 2000], [-8, 0, 8], { clamp: false })

  useAnimationFrame((_, delta) => {
    if (reduced || !inView) return
    const b = boost.get()
    if (b < -0.01) direction.current = -1
    else if (b > 0.01) direction.current = 1
    const speed = direction.current * (1 + Math.abs(b)) * (delta / 1000)

    dots.set((((dots.get() - speed * DOT_SPEED) % TILE) + TILE) % TILE)
    // the name runs the other way; the track holds two copies, so wrap at one copy
    let next = name.get() + speed * NAME_SPEED
    if (next > 0) next -= 100
    if (next <= -100) next += 100
    name.set(next)
  })

  // the dots drift by moving a layer (transform only: no repaint), wrapping every tile
  const dotsX = useTransform(dots, (v) => v - TILE)
  const nameX = useTransform(name, (v) => `${v / 2}%`)

  const copy = (key: string) => (
    <div className={styles.copy} key={key}>
      {NAMES.map((word, i) => (
        <span key={i} className={styles.word}>
          {word}
        </span>
      ))}
    </div>
  )

  return (
    <section ref={sectionRef} className={styles.section} aria-hidden="true">
      <div className={styles.polka}>
        <motion.div className={styles.dots} style={reduced ? undefined : { x: dotsX }} />
      </div>
      <div className={styles.nameTape}>
        <motion.div className={styles.track} style={reduced ? undefined : { x: nameX }}>
          {copy('a')}
          {copy('b')}
        </motion.div>
      </div>
    </section>
  )
}
