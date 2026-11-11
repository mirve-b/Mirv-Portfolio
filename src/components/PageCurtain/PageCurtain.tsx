import { AnimatePresence, motion } from 'framer-motion'
import styles from './PageCurtain.module.css'

export type CurtainPhase = 'idle' | 'cover' | 'reveal'

/** Seconds the curtain takes to fully cover the screen. */
export const CURTAIN_COVER_S = 0.55
/** Milliseconds the closed frame holds before the bars part. */
export const CURTAIN_HOLD_MS = 280
const EASE = [0.76, 0, 0.24, 1] as const
const SOFT = [0.16, 1, 0.3, 1] as const

type PageCurtainProps = {
  phase: CurtainPhase
  /** Changes every navigation so a fresh curtain mounts each time. */
  runId: number
  /** Fired once the screen is fully covered — swap the route here. */
  onCovered: () => void
  onRevealComplete: () => void
}

/**
 * Cinematic letterbox: two black bars close in from the top and bottom, a thin
 * hairline draws across the seam with the wordmark, the route swaps underneath,
 * then the bars part again.
 */
export function PageCurtain({ phase, runId, onCovered, onRevealComplete }: PageCurtainProps) {
  const active = phase !== 'idle'
  const covering = phase === 'cover'
  const barTransition = {
    duration: covering ? CURTAIN_COVER_S : 0.75,
    ease: EASE,
    delay: covering ? 0 : 0.12,
  }

  return (
    <AnimatePresence>
      {active ? (
        <div key={runId} className={styles.root} aria-hidden="true">
          <motion.div
            className={`${styles.bar} ${styles.top}`}
            initial={{ y: '-100%' }}
            animate={{ y: covering ? '0%' : '-100%' }}
            transition={barTransition}
          />
          <motion.div
            className={`${styles.bar} ${styles.bottom}`}
            initial={{ y: '100%' }}
            animate={{ y: covering ? '0%' : '100%' }}
            transition={barTransition}
            onAnimationComplete={() => {
              if (phase === 'cover') onCovered()
              else if (phase === 'reveal') onRevealComplete()
            }}
          />

          <div className={styles.center}>
            <motion.span
              className={styles.line}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={covering ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              transition={{ duration: covering ? 0.5 : 0.3, ease: SOFT, delay: covering ? 0.18 : 0 }}
            />
            <motion.span
              className={styles.mark}
              initial={{ opacity: 0, letterSpacing: '0.6em', filter: 'blur(6px)' }}
              animate={
                covering
                  ? { opacity: 1, letterSpacing: '0.32em', filter: 'blur(0px)' }
                  : { opacity: 0, letterSpacing: '0.45em', filter: 'blur(4px)' }
              }
              transition={{ duration: covering ? 0.6 : 0.3, ease: SOFT, delay: covering ? 0.22 : 0 }}
            >
              MIRVÉ
            </motion.span>
          </div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
