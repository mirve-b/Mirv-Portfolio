import { useCallback, useEffect, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PLAYLIST_LABEL, SPOTIFY, SPOTIFY_PLAYLIST_URI } from './constants'
import styles from './SpotifyDrawer.module.css'

type SpotifyDrawerProps = {
  open: boolean
  onClose: () => void
  embedHostRef: RefObject<HTMLDivElement | null>
  embedActive: boolean
}

export function SpotifyDrawer({
  open,
  onClose,
  embedHostRef,
  embedActive,
}: SpotifyDrawerProps) {
  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.button
            type="button"
            className={styles.backdrop}
            aria-label="Close Spotify player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />
        ) : null}
      </AnimatePresence>

      {SPOTIFY_PLAYLIST_URI ? (
        <aside
          className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
          role="dialog"
          aria-modal={open}
          aria-label={PLAYLIST_LABEL}
          aria-hidden={!open}
        >
          <div className={styles.header}>
            <span className={styles.heading}>{PLAYLIST_LABEL}</span>
            {open ? (
              <button
                type="button"
                className={styles.closeButton}
                aria-label="Close drawer"
                onClick={onClose}
              >
                ×
              </button>
            ) : null}
          </div>

          <div ref={embedHostRef} className={styles.playerWrap}>
            {embedActive ? null : (
              <div className={styles.playerPlaceholder} aria-hidden="true" />
            )}
          </div>

          {SPOTIFY.webUrl ? (
            <a
              href={SPOTIFY.webUrl}
              className={styles.spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
            >
              Open in Spotify
            </a>
          ) : null}
        </aside>
      ) : import.meta.env.DEV ? (
        <p className={styles.placeholder}>
          Add Spotify playlist URLs to your <code>.env</code> file.
        </p>
      ) : null}
    </>
  )
}
