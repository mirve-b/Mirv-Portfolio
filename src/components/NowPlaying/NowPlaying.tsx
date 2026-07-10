import { useCallback, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { PLAYLIST_LABEL, SPOTIFY_PLAYLIST_URI } from './constants'
import { useSpotifyController } from './hooks/useSpotifyController'
import styles from './NowPlaying.module.css'
import { SpotifyDrawer } from './SpotifyDrawer'
import { Waveform } from './Waveform'

export function NowPlaying() {
  const embedHostRef = useRef<HTMLDivElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { isPlaying } = useSpotifyController(embedHostRef, SPOTIFY_PLAYLIST_URI)

  const openDrawer = useCallback(() => {
    setDrawerOpen(true)
  }, [])

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openDrawer()
    }
  }

  return (
    <div className={styles.wrapper}>
      <motion.button
        type="button"
        className={styles.root}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`Open ${PLAYLIST_LABEL}`}
        aria-expanded={drawerOpen}
        aria-haspopup="dialog"
        onClick={openDrawer}
        onKeyDown={handleKeyDown}
      >
        <span className={styles.playIcon} aria-hidden="true">
          <svg viewBox="0 0 12 14" fill="none">
            <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
          </svg>
        </span>
        <span className={styles.labelRow}>
          <span className={styles.label}>{PLAYLIST_LABEL}</span>
          <Waveform active={isPlaying} />
        </span>
      </motion.button>

      <SpotifyDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        embedHostRef={embedHostRef}
      />
    </div>
  )
}
