import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './IntroSplash.module.css'

const DISPLAY_FONT = '400 1em "Alumni Sans Pinstripe"'
const WORD = 'MIRVÉ'
const TYPE_START_MS = 450
const TYPE_STEP_MS = 170
const FADE_IN_MS = TYPE_START_MS + WORD.length * TYPE_STEP_MS
const LOGO_HOLD_MS = 1900
const FADE_OUT_MS = 2000
const EASE = [0.16, 1, 0.3, 1] as const

type SplashPhase = 'idle' | 'fadeIn' | 'hold' | 'fadeOut'

type IntroSplashProps = {
  /** Mount main site underneath — when MIRVÉ begins fading out */
  onReveal: () => void
  onExitComplete: () => void
}

const splashVariants = {
  visible: {
    opacity: 1,
    transition: { duration: 0 },
  },
  fadeOut: {
    opacity: 0,
    transition: { duration: FADE_OUT_MS / 1000, ease: EASE },
  },
}

const logoVariants = {
  visible: { opacity: 1, filter: 'blur(0px)' },
  fadeOut: {
    opacity: 0,
    filter: 'blur(6px)',
    transition: { duration: (FADE_OUT_MS * 0.55) / 1000, ease: EASE },
  },
}

/** Each key "strikes": pops in a touch large and blurred, then settles crisp. */
const keyStrike = {
  initial: { opacity: 0, scale: 1.3, filter: 'blur(5px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  transition: { type: 'spring' as const, stiffness: 700, damping: 26, mass: 0.6 },
}

export function IntroSplash({ onReveal, onExitComplete }: IntroSplashProps) {
  const [fontReady, setFontReady] = useState(false)
  const [phase, setPhase] = useState<SplashPhase>('idle')
  const [typed, setTyped] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadDisplayFont = async () => {
      try {
        if ('fonts' in document) {
          await document.fonts.load(DISPLAY_FONT)
          await document.fonts.ready
        }
      } catch {
        /* fallback font */
      }

      if (!cancelled) setFontReady(true)
    }

    void loadDisplayFont()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!fontReady) return

    setPhase('fadeIn')

    let typeTimer = 0
    const startTimer = window.setTimeout(() => {
      setTyped(1)
      typeTimer = window.setInterval(() => {
        setTyped((n) => {
          if (n + 1 >= WORD.length) window.clearInterval(typeTimer)
          return Math.min(n + 1, WORD.length)
        })
      }, TYPE_STEP_MS)
    }, TYPE_START_MS)

    const holdTimer = window.setTimeout(() => {
      setPhase('hold')
    }, FADE_IN_MS)

    const fadeOutTimer = window.setTimeout(() => {
      onReveal()
      setPhase('fadeOut')
    }, FADE_IN_MS + LOGO_HOLD_MS)

    return () => {
      window.clearTimeout(startTimer)
      window.clearInterval(typeTimer)
      window.clearTimeout(holdTimer)
      window.clearTimeout(fadeOutTimer)
    }
  }, [fontReady, onReveal])

  const typing = phase !== 'idle' && typed < WORD.length
  const letters = Array.from(WORD)
  const splashState = phase === 'fadeOut' ? 'fadeOut' : 'visible'

  return (
    <motion.div
      className={styles.splash}
      variants={splashVariants}
      initial="visible"
      animate={splashState}
      onAnimationComplete={() => {
        if (phase === 'fadeOut') onExitComplete()
      }}
    >
      <motion.h1
        className={styles.logo}
        variants={logoVariants}
        initial="visible"
        animate={phase === 'fadeOut' ? 'fadeOut' : 'visible'}
      >
        <span className={styles.srOnly}>{WORD}</span>
        <span className={styles.letters} aria-hidden="true">
          {letters.slice(0, typed).map((char, index) => (
            <motion.span key={index} className={styles.letter} {...keyStrike}>
              {char}
            </motion.span>
          ))}
          {phase !== 'idle' ? (
            <span className={styles.caret} data-typing={typing ? '' : undefined} />
          ) : null}
          {letters.slice(typed).map((char, index) => (
            <span key={`ghost-${index}`} className={styles.ghost}>
              {char}
            </span>
          ))}
        </span>
      </motion.h1>
    </motion.div>
  )
}
