import { useRef } from 'react'
import { motion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { AboutOrchid } from './AboutOrchid'
import styles from './AboutIntro.module.css'

/** One letter that rises out of a blur as the section scrolls into place. */
function Letter({ char, progress, index, total }: { char: string; progress: MotionValue<number>; index: number; total: number }) {
  const start = (index / total) * 0.5
  const end = start + 0.45
  const y = useTransform(progress, [start, end], ['110%', '0%'])
  const rotate = useTransform(progress, [start, end], [18, 0])
  const opacity = useTransform(progress, [start, start + 0.15], [0, 1])
  const blur = useTransform(progress, [start, end], ['blur(10px)', 'blur(0px)'])
  return (
    <span className={styles.mask}>
      <motion.span className={styles.char} style={{ y, rotate, opacity, filter: blur }}>
        {char === ' ' ? ' ' : char}
      </motion.span>
    </span>
  )
}

/** A line that wipes in from the left on its own stretch of scroll. */
function Line({ children, progress, from }: { children: React.ReactNode; progress: MotionValue<number>; from: number }) {
  const clip = useTransform(progress, [from, from + 0.3], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  const x = useTransform(progress, [from, from + 0.3], [-24, 0])
  return (
    <motion.p className={styles.line} style={{ clipPath: clip, x }}>
      {children}
    </motion.p>
  )
}

/**
 * ABOUT ME, set heavy and light. Letters climb out of a blur one after another as you scroll, the
 * heading drifts sideways, and the lines below wipe in underneath it.
 */
export function AboutIntro() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'center 45%'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.4 })
  const progress = useTransform(smooth, (v) => (reduced ? 1 : v))
  const drift = useTransform(progress, [0, 1], ['18%', '0%'])

  const bold = 'ABOUT'
  const light = 'ME'
  const total = bold.length + light.length + 1

  return (
    <section ref={ref} className={styles.section} aria-labelledby="about-heading">
      <motion.h2 id="about-heading" className={styles.heading} style={{ x: drift }} aria-label="About me">
        <span className={styles.bold} aria-hidden="true">
          {Array.from(bold).map((c, i) => (
            <Letter key={`b${i}`} char={c} progress={progress} index={i} total={total} />
          ))}
        </span>
        <span className={styles.light} aria-hidden="true">
          {Array.from(light).map((c, i) => (
            <Letter key={`l${i}`} char={c} progress={progress} index={bold.length + 1 + i} total={total} />
          ))}
        </span>
      </motion.h2>

      {/* ABOUT ORCHID — its own file: AboutOrchid.tsx */}
      <AboutOrchid progress={progress} />

      <div className={styles.copy}>
        <Line progress={progress} from={0.45}>
          Somewhere between art and engineering.
        </Line>
        <Line progress={progress} from={0.6}>
          Making the internet a little less boring. Design, code,
          <br />
          and whatever comes next.
        </Line>
      </div>
    </section>
  )
}
