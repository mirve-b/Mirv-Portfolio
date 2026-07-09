import { type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { DEFAULT_TRACK } from './constants'
import { useNowPlaying } from './hooks/useNowPlaying'
import { PlayButton } from './PlayButton'
import { ProgressBar } from './ProgressBar'
import styles from './NowPlaying.module.css'
import type { NowPlayingTrack } from './types'
import { Waveform } from './Waveform'

type NowPlayingProps = {
  track?: NowPlayingTrack
}

export function NowPlaying({ track = DEFAULT_TRACK }: NowPlayingProps) {
  const {
    audioRef,
    isPlaying,
    progress,
    analyser,
    togglePlayback,
    formattedCurrent,
    formattedDuration,
  } = useNowPlaying()

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      void togglePlayback()
    }
  }

  return (
    <motion.div
      className={styles.root}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.03 }}
      role="group"
      aria-label={`Now playing: ${track.title} by ${track.artist}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={() => void togglePlayback()}
    >
      <PlayButton
        isPlaying={isPlaying}
        onToggle={() => void togglePlayback()}
      />

      <div className={styles.meta}>
        <div className={styles.titleRow}>
          <span className={styles.title}>{track.title}</span>
          <Waveform analyser={analyser} isPlaying={isPlaying} />
        </div>

        <div className={styles.detailRow}>
          <span className={styles.artist}>{track.artist}</span>
          <span className={styles.duration}>
            {isPlaying ? formattedCurrent : formattedDuration}
          </span>
        </div>

        <ProgressBar progress={progress} isPlaying={isPlaying} />
      </div>

      <audio ref={audioRef} src={track.audioSrc} preload="metadata" />
    </motion.div>
  )
}
