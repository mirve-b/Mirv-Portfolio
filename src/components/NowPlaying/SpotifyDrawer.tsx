import { useCallback, useEffect, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PLAYLIST_LABEL, SPOTIFY } from './constants'
import styles from './SpotifyDrawer.module.css'

type SpotifyDrawerProps = {
  open: boolean
  onClose: () => void
  embedHostRef: RefObject<HTMLDivElement | null>
  embedActive: boolean
  embedReady: boolean
}

export function SpotifyDrawer({
  open,
  onClose,
  embedHostRef,
  embedActive,
  embedReady,
}: SpotifyDrawerProps) {
  const handleBackdropClick = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    // a tap anywhere outside the player and its button closes it (taps inside the
    // Spotify embed land in its iframe, so they never reach here)
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null
      if (target?.closest('[data-playlist-root]')) return
      onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    // wait a tick so the tap that opened the player doesn't close it straight away
    const timer = window.setTimeout(() => document.addEventListener('pointerdown', onPointerDown, true), 0)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
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

      <aside
        className={open ? `${styles.drawer} ${styles.drawerOpen}` : styles.drawer}
        role="dialog"
        aria-modal={open}
        aria-label={PLAYLIST_LABEL}
        aria-hidden={!open}
      >
        <div className={styles.header}>
          <span className={styles.heading}>{PLAYLIST_LABEL}</span>
          <span className={styles.code} aria-hidden="true">
            MRV-SND-01
          </span>
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
          {embedActive && !embedReady ? (
            <div className={styles.playerLoading} aria-live="polite">
              <span className={styles.playerLoadingSpinner} />
              <span className={styles.playerLoadingText}>Loading player…</span>
            </div>
          ) : null}
        </div>

        <div className={styles.footer}>
          {SPOTIFY.webUrl ? (
            <a
              href={SPOTIFY.webUrl}
              className={styles.spotifyLink}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
            >
              Open in Spotify <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <span />
          )}
          <span className={styles.footerNote} aria-hidden="true">
            Esc to close
          </span>
        </div>
      </aside>
    </>
  )
}
