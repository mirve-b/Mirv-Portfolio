import { motion } from 'framer-motion'
import styles from './NowPlaying.module.css'

type PlayButtonProps = {
  isPlaying: boolean
  onToggle: () => void
}

export function PlayButton({ isPlaying, onToggle }: PlayButtonProps) {
  return (
    <button
      type="button"
      className={styles.playButton}
      onClick={(event) => {
        event.stopPropagation()
        onToggle()
      }}
      aria-label={isPlaying ? 'Pause track' : 'Play track'}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <motion.span
          className={styles.vinyl}
          animate={{ rotate: 360 }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          aria-hidden="true"
        >
          <span className={styles.vinylInner} />
          <span className={styles.vinylHole} />
        </motion.span>
      ) : (
        <span className={styles.playIcon} aria-hidden="true">
          <svg viewBox="0 0 12 14" fill="none">
            <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
          </svg>
        </span>
      )}

      {isPlaying ? (
        <span className={styles.pauseOverlay} aria-hidden="true">
          <svg viewBox="0 0 10 10" fill="none">
            <rect x="1.5" y="1" width="2" height="8" fill="currentColor" />
            <rect x="6.5" y="1" width="2" height="8" fill="currentColor" />
          </svg>
        </span>
      ) : null}
    </button>
  )
}
