import { useCallback, useEffect, useRef, useState } from 'react'
import { startMutedPreview } from '../../lib/mediaUtils'
import { MediaLoader } from '../ExpertiseSection/ShowcaseVideoCard'
import styles from './DevSuitePreviewVideo.module.css'

export function DevSuitePreviewVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loading, setLoading] = useState(true)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

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

  const handleToggleMute = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    if (muted) {
      video.muted = false
      try {
        if (video.paused) await video.play()
        setMuted(false)
      } catch {
        video.muted = true
        setMuted(true)
      }
      return
    }

    video.muted = true
    setMuted(true)
    if (video.paused) void startMutedPreview(video)
  }, [muted])

  return (
    <div
      className={styles.previewVideoWrap}
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
        className={styles.previewVideo}
        loop
        muted
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
          void handleToggleMute()
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
