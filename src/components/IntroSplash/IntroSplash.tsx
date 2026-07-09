import { useEffect } from 'react'
import { motion } from 'framer-motion'
import styles from './IntroSplash.module.css'

type IntroSplashProps = {
  onComplete: () => void
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, 3200)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className={styles.splash}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h1
        className={styles.logo}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: [0, 1, 1, 0],
          scale: [0.96, 1, 1, 1.02],
        }}
        transition={{
          duration: 2.6,
          times: [0, 0.25, 0.65, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        MIRVÉ
      </motion.h1>
    </motion.div>
  )
}
