import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './IntroSplash.module.css'

const DISPLAY_FONT = '400 1em "Alumni Sans Pinstripe"'
const FADE_IN_MS = 1000
const LOGO_HOLD_MS = 3000
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
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: FADE_IN_MS / 1000, ease: EASE },
  },
  fadeOut: {
    opacity: 0,
    scale: 1,
    transition: { duration: (FADE_OUT_MS * 0.55) / 1000, ease: EASE },
  },
}

export function IntroSplash({ onReveal, onExitComplete }: IntroSplashProps) {
  const [fontReady, setFontReady] = useState(false)
  const [phase, setPhase] = useState<SplashPhase>('idle')

  useEffect(() => {
    void import('../../assets/hero.mov')
  }, [])

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

    const holdTimer = window.setTimeout(() => {
      setPhase('hold')
    }, FADE_IN_MS)

    const fadeOutTimer = window.setTimeout(() => {
      onReveal()
      setPhase('fadeOut')
    }, FADE_IN_MS + LOGO_HOLD_MS)

    return () => {
      window.clearTimeout(holdTimer)
      window.clearTimeout(fadeOutTimer)
    }
  }, [fontReady, onReveal])

  const logoState =
    phase === 'idle' ? 'hidden' : phase === 'fadeOut' ? 'fadeOut' : 'visible'
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
        initial="hidden"
        animate={logoState}
      >
        MIRVÉ
      </motion.h1>
    </motion.div>
  )
}
