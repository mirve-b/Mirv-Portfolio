import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'
import styles from './IntroSplash.module.css'

const FONTS = ['500 1em "Montserrat"', '400 1em "Pinyon Script"']
const EASE = [0.16, 1, 0.3, 1] as const
const LETTERS = ['I', 'R', 'V', 'É']

/** Timeline (ms) */
const T = { script: 400, firstLetter: 1150, step: 430, reveal: 4300, exit: 5400 }

type IntroSplashProps = {
  /** Mount main site underneath, as the wordmark starts to leave */
  onReveal: () => void
  onExitComplete: () => void
}

/** Each piece arrives soft and out of focus, then settles crisp. */
const focusIn = (delay: number, reduced: boolean) =>
  reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay: delay / 1000 } }
    : {
        initial: { opacity: 0, filter: 'blur(12px)', y: 4 },
        animate: { opacity: 1, filter: 'blur(0px)', y: 0 },
        transition: { duration: 1.7, ease: EASE, delay: delay / 1000 },
      }

/**
 * The splash, in the same voice as the hero: on black, the wordmark builds itself — the script M first,
 * then I-R-V-É letter by letter, each slowly coming out of a blur into focus, and the mark softly
 * blurs away into the site.
 */
export function IntroSplash({ onReveal, onExitComplete }: IntroSplashProps) {
  const reduced = useReducedMotion()
  const [ready, setReady] = useState(false)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    let timer = 0
    const start = async () => {
      try {
        await Promise.race([
          Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => document.fonts.ready),
          new Promise((r) => setTimeout(r, 1500)),
        ])
      } catch {
        /* fallback fonts */
      }
      if (cancelled) return
      setReady(true)
      timer = window.setTimeout(() => {
        onReveal()
        setLeaving(true)
      }, reduced ? 1200 : T.reveal)
    }
    void start()
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [onReveal, reduced])

  return (
    <motion.div
      className={styles.splash}
      initial={{ opacity: 1 }}
      animate={{ opacity: leaving ? 0 : 1 }}
      transition={{ duration: (T.exit - T.reveal) / 1000, ease: EASE }}
      onAnimationComplete={() => {
        if (leaving) onExitComplete()
      }}
    >
      <motion.h1
        className={styles.mark}
        aria-label="Mirvé"
        animate={leaving && !reduced ? { filter: 'blur(10px)', scale: 1.04 } : { filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: (T.exit - T.reveal) / 1000, ease: EASE }}
      >
        {ready ? (
          <>
            <motion.span className={styles.script} aria-hidden="true" {...focusIn(T.script, reduced)}>
              M
            </motion.span>
            <span className={styles.word} aria-hidden="true">
              <span className={styles.name}>
                {LETTERS.map((ch, i) => (
                  <motion.span key={ch} className={styles.letter} {...focusIn(T.firstLetter + i * T.step, reduced)}>
                    {ch}
                  </motion.span>
                ))}
              </span>
            </span>
          </>
        ) : null}
      </motion.h1>
    </motion.div>
  )
}
