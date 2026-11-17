import { useRef } from 'react'
import { motion, useMotionValue, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useNativeScrollAnimations } from '../../lib/useNativeScrollAnimations'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { AboutOrchid } from './AboutOrchid'
import styles from './AboutIntro.module.css'

type Range = { native: boolean }

/** CSS variables that place an element's native animation on its stretch of the section's scroll. */
const span = (s: number, e: number, f?: number) =>
  ({ '--s': s, '--e': e, ...(f !== undefined ? { '--f': f } : {}) }) as React.CSSProperties

/** One letter that rises out of a blur as the section scrolls into place. */
function Letter({ char, progress, index, total, native }: { char: string; progress: MotionValue<number>; index: number; total: number } & Range) {
  const start = (index / total) * 0.5
  const end = start + 0.45
  const y = useTransform(progress, [start, end], ['110%', '0%'])
  const rotate = useTransform(progress, [start, end], [18, 0])
  const opacity = useTransform(progress, [start, start + 0.15], [0, 1])
  const blur = useTransform(progress, [start, end], ['blur(10px)', 'blur(0px)'])
  return (
    <span className={styles.mask}>
      <motion.span
        className={styles.char}
        style={native ? span(start, end, start + 0.15) : { y, rotate, opacity, filter: blur }}
      >
        {char === ' ' ? ' ' : char}
      </motion.span>
    </span>
  )
}

/** A line that wipes in from the left on its own stretch of scroll. */
function Line({ children, progress, from, native }: { children: React.ReactNode; progress: MotionValue<number>; from: number } & Range) {
  const clip = useTransform(progress, [from, from + 0.3], ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'])
  const x = useTransform(progress, [from, from + 0.3], [-24, 0])
  return (
    <motion.p className={styles.line} style={native ? span(from, from + 0.3) : { clipPath: clip, x }}>
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
  // native scroll timeline where supported (see AboutIntro.module.css); framer-motion otherwise
  const native = useNativeScrollAnimations()
  const { scrollYProgress } = useScroll(native ? undefined : { target: ref, offset: ['start 85%', 'center 45%'] })
  // driven straight by the scroll (no spring), so it tracks the finger on phones
  // natively animated: the JS formulas get a fixed value, so they never recompute while scrolling
  const idle = useMotionValue(1)
  const progress = useTransform(native ? idle : scrollYProgress, (v) => (reduced ? 1 : v))
  const drift = useTransform(progress, [0, 1], ['18%', '0%'])

  const bold = 'ABOUT'
  const light = 'ME'
  const total = bold.length + light.length + 1

  return (
    <section
      ref={ref}
      className={styles.section}
      data-css-scroll={native ? '' : undefined}
      aria-labelledby="about-heading"
    >
      <motion.h2 id="about-heading" className={styles.heading} style={native ? undefined : { x: drift }} aria-label="About me">
        <span className={styles.bold} aria-hidden="true">
          {Array.from(bold).map((c, i) => (
            <Letter key={`b${i}`} char={c} progress={progress} index={i} total={total} native={native} />
          ))}
        </span>
        <span className={styles.light} aria-hidden="true">
          {Array.from(light).map((c, i) => (
            <Letter key={`l${i}`} char={c} progress={progress} index={bold.length + 1 + i} total={total} native={native} />
          ))}
        </span>
      </motion.h2>

      {/* ABOUT ORCHID — its own file: AboutOrchid.tsx */}
      <AboutOrchid progress={progress} native={native} />

      <div className={styles.copy}>
        <Line progress={progress} from={0.45} native={native}>
          Somewhere between art and engineering.
        </Line>
        <Line progress={progress} from={0.6} native={native}>
          Making the internet a little less boring. Design, code,
          <br />
          and whatever comes next.
        </Line>
      </div>
    </section>
  )
}
