import { motion } from 'framer-motion'
import styles from './NowPlaying.module.css'

type ProgressBarProps = {
  progress: number
  isPlaying: boolean
}

export function ProgressBar({ progress, isPlaying }: ProgressBarProps) {
  return (
    <div
      className={styles.progressTrack}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      aria-label="Track progress"
    >
      <motion.div
        className={styles.progressFill}
        animate={{ scaleX: progress }}
        transition={
          isPlaying
            ? { duration: 0.15, ease: 'linear' }
            : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
        style={{ transformOrigin: 'left center' }}
      />
    </div>
  )
}
