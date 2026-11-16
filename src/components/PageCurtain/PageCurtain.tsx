import { AnimatePresence, motion } from 'framer-motion'
import styles from './PageCurtain.module.css'

export type CurtainPhase = 'idle' | 'cover' | 'reveal'

/** Seconds the black takes to fully cover the screen. */
export const CURTAIN_COVER_S = 0.45
/** Milliseconds the black screen holds before it fades away. */
export const CURTAIN_HOLD_MS = 260

type PageCurtainProps = {
  phase: CurtainPhase
  /** Changes every navigation so a fresh curtain mounts each time. */
  runId: number
  /** Fired once the screen is fully covered — swap the route here. */
  onCovered: () => void
  onRevealComplete: () => void
}

/** A plain fade to black with the name, small, breathing in the middle; then a fade back. */
export function PageCurtain({ phase, runId, onCovered, onRevealComplete }: PageCurtainProps) {
  const active = phase !== 'idle'
  const covering = phase === 'cover'

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          key={runId}
          className={styles.root}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: covering ? 1 : 0 }}
          transition={{ duration: covering ? CURTAIN_COVER_S : 0.55, ease: 'easeInOut' }}
          onAnimationComplete={() => {
            if (phase === 'cover') onCovered()
            else if (phase === 'reveal') onRevealComplete()
          }}
        >
          <span className={styles.mark}>MIRVÉ</span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
