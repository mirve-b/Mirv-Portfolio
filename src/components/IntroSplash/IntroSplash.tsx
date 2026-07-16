import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import styles from './IntroSplash.module.css'

const DISPLAY_FONT = '400 1em "Alumni Sans Pinstripe"'
const FADE_IN_MS = 600
const LOGO_HOLD_MS = 3000
const FADE_OUT_MS = 1000
const EASE = [0.16, 1, 0.3, 1] as const

type SplashPhase = 'idle' | 'fadeIn' | 'hold' | 'fadeOut'

type IntroSplashProps = {
  /** Mount main site underneath — when MIRVÉ begins fading out */
  onReveal: () => void
  onExitComplete: () => void
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

  const logoOpacity = phase === 'idle' ? 0 : phase === 'fadeOut' ? 0 : 1
  const splashOpacity = phase === 'fadeOut' ? 0 : 1

  const logoTransition =
    phase === 'fadeIn'
      ? { duration: FADE_IN_MS / 1000, ease: EASE }
      : phase === 'fadeOut'
        ? { duration: FADE_OUT_MS / 1000, ease: EASE }
        : { duration: 0 }

  const splashTransition =
    phase === 'fadeOut'
      ? { duration: FADE_OUT_MS / 1000, ease: EASE }
      : { duration: 0 }

  return (
    <motion.div
      className={styles.splash}
      initial={{ opacity: 1 }}
      animate={{ opacity: splashOpacity }}
      transition={splashTransition}
      onAnimationComplete={() => {
        if (phase === 'fadeOut') onExitComplete()
      }}
    >
      <motion.h1
        className={styles.logo}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{
          opacity: logoOpacity,
          scale: phase === 'idle' ? 0.97 : 1,
        }}
        transition={logoTransition}
      >
        MIRVÉ
      </motion.h1>
    </motion.div>
  )
}
