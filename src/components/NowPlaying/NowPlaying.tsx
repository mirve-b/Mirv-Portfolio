import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { registerSpotifyControls } from '../../lib/spotifyPlayback'
import { PLAYLIST_LABEL, SPOTIFY_PLAYLIST_URI } from './constants'
import { useSpotifyController } from './hooks/useSpotifyController'
import { preloadSpotifyIframeApi } from './spotifyPreload'
import styles from './NowPlaying.module.css'
import { SpotifyDrawer } from './SpotifyDrawer'
import { Waveform } from './Waveform'

export function NowPlaying() {
  const embedHostRef = useRef<HTMLDivElement>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [embedActive, setEmbedActive] = useState(false)

  const { isPlaying, isFading, pause, smoothPause } = useSpotifyController(
    embedHostRef,
    SPOTIFY_PLAYLIST_URI,
    embedActive,
  )

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
  }, [])

  const pausePlayback = useCallback(() => {
    pause()
    setDrawerOpen(false)
  }, [pause])

  const smoothPausePlayback = useCallback(() => {
    smoothPause()
  }, [smoothPause])

  useEffect(() => {
    return registerSpotifyControls({
      pause: pausePlayback,
      smoothPause: smoothPausePlayback,
      closeDrawer,
    })
  }, [pausePlayback, smoothPausePlayback, closeDrawer])

  const openPlayer = useCallback(() => {
    setEmbedActive(true)
    preloadSpotifyIframeApi()
    setDrawerOpen(true)
  }, [])

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPlayer()
    }
  }

  return (
    <div className={styles.wrapper}>
      <motion.button
        type="button"
        className={styles.root}
        data-fading={isFading ? '' : undefined}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        aria-label={isPlaying ? `Pause ${PLAYLIST_LABEL}` : `Open ${PLAYLIST_LABEL}`}
        aria-expanded={drawerOpen}
        aria-haspopup="dialog"
        onClick={openPlayer}
        onKeyDown={handleKeyDown}
      >
        <span
          className={styles.playIcon}
          data-playing={isPlaying ? '' : undefined}
          aria-hidden="true"
        >
          {isPlaying ? (
            <svg viewBox="0 0 12 14" fill="none">
              <rect x="1" y="1" width="3.5" height="12" rx="0.5" fill="currentColor" />
              <rect x="7.5" y="1" width="3.5" height="12" rx="0.5" fill="currentColor" />
            </svg>
          ) : (
            <svg viewBox="0 0 12 14" fill="none">
              <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
            </svg>
          )}
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
        embedActive={embedActive}
      />
    </div>
  )
}
