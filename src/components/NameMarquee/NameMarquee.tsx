import { useEffect, useRef } from 'react'
import { motion, useInView, useMotionValue, useTransform } from 'framer-motion'
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
  // only animate while the tapes are on screen
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { margin: '200px 0px' })

  // the drift loop runs only while the tapes are on screen (nothing per frame otherwise). Scroll
  // speed is measured inside it and eased, so the tapes still speed up and flip with the scroll.
  useEffect(() => {
    if (reduced || !inView) return
    let raf = 0
    let last = performance.now()
    let lastY = window.scrollY
    let velocity = 0 // eased scroll speed, px/s
    let direction = 1

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      const y = window.scrollY
      const raw = dt > 0 ? (y - lastY) / dt : 0
      lastY = y
      velocity += (raw - velocity) * (1 - Math.exp(-dt * 14))

      const boost = (velocity / 2000) * 8
      if (boost < -0.01) direction = -1
      else if (boost > 0.01) direction = 1
      const speed = direction * (1 + Math.abs(boost)) * dt

      dots.set((((dots.get() - speed * DOT_SPEED) % TILE) + TILE) % TILE)
      // the name runs the other way; the track holds two copies, so wrap at one copy
      let next = name.get() + speed * NAME_SPEED
      if (next > 0) next -= 100
      if (next <= -100) next += 100
      name.set(next)

      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, inView, dots, name])

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
