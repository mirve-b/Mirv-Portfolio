import { useCallback, useEffect, useRef, useState } from 'react'
import { startMutedPreview } from '../../lib/mediaUtils'
import {
  pauseSpotifyPlayback,
  smoothPauseSpotifyPlayback,
} from '../../lib/spotifyPlayback'
import { useMuteVideoOnSpotifyPlay } from '../../lib/useMuteVideoOnSpotifyPlay'
import { MediaLoader } from '../ExpertiseSection/ShowcaseVideoCard'
import styles from './DevSuitePreviewVideo.module.css'

const SPOTIFY_HANDOFF_MS = 600

export function DevSuitePreviewVideo({
  src,
  fillCard = false,
}: {
  src: string
  fillCard?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const spotifyHandoffRef = useRef(false)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true

    const onCanPlay = () => setLoading(false)
    const onWaiting = () => setLoading(true)
    const onPlaying = () => setLoading(false)

    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('playing', onPlaying)

    void startMutedPreview(video)

    return () => {
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('playing', onPlaying)
      video.pause()
    }
  }, [src])

  const finishSpotifyHandoff = useCallback(() => {
    window.setTimeout(() => {
      spotifyHandoffRef.current = false
    }, SPOTIFY_HANDOFF_MS)
  }, [])

  const handleMute = useCallback(() => {
    if (spotifyHandoffRef.current) return

    const video = videoRef.current
    if (!video) return

    video.muted = true
    setMuted(true)
    if (video.paused) void startMutedPreview(video)
  }, [])

  useMuteVideoOnSpotifyPlay(!muted, handleMute, true)

  const handleToggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    if (muted) {
      spotifyHandoffRef.current = true
      pauseSpotifyPlayback()
      smoothPauseSpotifyPlayback()

      video.muted = false
      video.loop = true
      setMuted(false)

      void video
        .play()
        .catch(() => {
          video.muted = true
          setMuted(true)
        })
        .finally(finishSpotifyHandoff)
      return
    }

    video.muted = true
    setMuted(true)
    if (video.paused) void startMutedPreview(video)
  }, [finishSpotifyHandoff, muted])

  return (
    <div
      className={`${styles.previewVideoWrap}${
        fillCard ? ` ${styles.previewVideoWrapFill}` : ''
      }`}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {loading ? (
        <div className={styles.previewLoaderSlot}>
          <MediaLoader label="Loading preview" />
        </div>
      ) : null}
      <video
        ref={videoRef}
        src={src}
        className={`${styles.previewVideo}${
          fillCard ? ` ${styles.previewVideoFill}` : ''
        }`}
        loop
        playsInline
        autoPlay
        preload="auto"
        draggable={false}
      />
      <button
        type="button"
        className={styles.previewMuteButton}
        aria-label={muted ? 'Unmute preview video' : 'Mute preview video'}
        onClick={(event) => {
          event.stopPropagation()
          handleToggleMute()
        }}
      >
        <span className={styles.previewMuteIcon} aria-hidden="true">
          {muted ? (
            <svg viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 5.5H4.5L7.5 3V11L4.5 8.5H2.5V5.5Z"
                fill="currentColor"
              />
              <path
                d="M9.5 5.5C10 6 10.25 6.75 10.25 7.25C10.25 7.75 10 8.5 9.5 9"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 5.5H4.5L7.5 3V11L4.5 8.5H2.5V5.5Z"
                fill="currentColor"
              />
              <path
                d="M10.5 4.5L9 6M9 6L10.5 7.5M9 6L7.5 7.5M9 6L10.5 4.5"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>
    </div>
  )
}
