import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react'
import { loadProjectShowcaseVideo } from '../../data/projectAssets'
import styles from './ExpertiseSection.module.css'

export function MediaLoader({ label = 'Loading preview' }: { label?: string }) {
  return (
    <div className={styles.mediaLoader} aria-hidden="true">
      <span className={styles.mediaLoaderSpinner} />
      <span className={styles.mediaLoaderText}>{label}</span>
    </div>
  )
}

export function ShowcaseVideoCard({
  poster,
  projectId,
}: {
  poster: string
  projectId: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const loadedVideoSrcRef = useRef<string | null>(null)
  const [videoSrc, setVideoSrc] = useState<string>()
  const [videoLoading, setVideoLoading] = useState(false)
  const [videoActive, setVideoActive] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const showPlayButton = !videoLoading && !isPlaying

  useEffect(() => {
    let cancelled = false

    void loadProjectShowcaseVideo(projectId).then((src) => {
      if (!cancelled && src) setVideoSrc(src)
    })

    return () => {
      cancelled = true
    }
  }, [projectId, poster])

  useEffect(() => {
    setVideoLoading(false)
    setVideoActive(false)
    setIsPlaying(false)
    loadedVideoSrcRef.current = null
  }, [poster, projectId])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoActive) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
    }
  }, [videoActive])

  const handlePlayButton = useCallback(
    async (event: MouseEvent) => {
      event.stopPropagation()
      const video = videoRef.current
      if (!video) return

      setVideoLoading(true)

      if (videoActive && video.paused && loadedVideoSrcRef.current) {
        video.muted = true
        try {
          await video.play()
          setIsPlaying(true)
        } catch {
          /* playback blocked */
        } finally {
          setVideoLoading(false)
        }
        return
      }

      let src = videoSrc
      if (!src) {
        src = await loadProjectShowcaseVideo(projectId)
        if (!src) {
          setVideoLoading(false)
          return
        }
        setVideoSrc(src)
      }

      const startPlayback = async () => {
        video.loop = true
        video.muted = true

        try {
          await video.play()
        } catch {
          /* autoplay blocked */
        }

        setVideoActive(true)
        setIsPlaying(true)
        setVideoLoading(false)
      }

      try {
        if (loadedVideoSrcRef.current !== src) {
          loadedVideoSrcRef.current = src
          video.src = src
          video.preload = 'auto'

          await new Promise<void>((resolve, reject) => {
            const onReady = () => {
              cleanup()
              resolve()
            }
            const onError = () => {
              cleanup()
              reject(new Error('Video failed to load'))
            }
            const cleanup = () => {
              video.removeEventListener('canplay', onReady)
              video.removeEventListener('error', onError)
            }

            video.addEventListener('canplay', onReady, { once: true })
            video.addEventListener('error', onError, { once: true })
            video.load()
          })
        } else if (video.readyState < 3) {
          await new Promise<void>((resolve, reject) => {
            const onReady = () => {
              cleanup()
              resolve()
            }
            const onError = () => {
              cleanup()
              reject(new Error('Video failed to load'))
            }
            const cleanup = () => {
              video.removeEventListener('canplay', onReady)
              video.removeEventListener('error', onError)
            }

            video.addEventListener('canplay', onReady, { once: true })
            video.addEventListener('error', onError, { once: true })
          })
        }

        await startPlayback()
      } catch {
        setVideoLoading(false)
      }
    },
    [projectId, videoActive, videoSrc],
  )

  const handleVideoClick = useCallback(async () => {
    if (!videoActive || videoLoading || showPlayButton) return

    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.muted = true
      try {
        await video.play()
        setIsPlaying(true)
      } catch {
        /* playback blocked */
      }
      return
    }

    video.pause()
    setIsPlaying(false)
  }, [showPlayButton, videoActive, videoLoading])

  return (
    <div className={styles.showcaseVideoWrap}>
      {videoLoading ? (
        <div className={styles.showcaseLoaderSlot}>
          <MediaLoader label="Loading video" />
        </div>
      ) : null}
      {!videoActive ? (
        <img
          src={poster}
          alt=""
          className={styles.showcasePoster}
          draggable={false}
          decoding="async"
        />
      ) : null}
      <video
        ref={videoRef}
        className={styles.showcaseVideo}
        data-ready={poster ? 'true' : undefined}
        data-active={videoActive ? 'true' : undefined}
        loop
        muted
        playsInline
        preload="none"
        draggable={false}
        onClick={handleVideoClick}
      />
      {showPlayButton ? (
        <button
          type="button"
          className={styles.showcasePlayButton}
          aria-label="Play video"
          onClick={handlePlayButton}
        >
          <span className={styles.showcasePlayIcon} aria-hidden="true">
            <svg viewBox="0 0 12 14" fill="none">
              <path d="M1 1.5L11 7L1 12.5V1.5Z" fill="currentColor" />
            </svg>
          </span>
        </button>
      ) : null}
      {videoActive && isPlaying && !videoLoading ? (
        <div className={styles.showcasePausedHint} aria-hidden="true" />
      ) : null}
    </div>
  )
}
