import { useCallback, useEffect, useRef, useState } from 'react'
import type { PortfolioProject } from '../../data/portfolioProjects'
import { isVideoAsset, startMutedPreview } from '../../lib/mediaUtils'
import { smoothPauseSpotifyPlayback, SMOOTH_PAUSE_MS } from '../../lib/spotifyPlayback'
import styles from './ProjectGallery.module.css'

type ProjectGalleryProps = {
  project: PortfolioProject
  onBack: () => void
}

type GalleryVideoItemProps = {
  src: string
}

function GalleryVideoItem({ src }: GalleryVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isUnmuted, setIsUnmuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void startMutedPreview(video)
          return
        }

        video.pause()
        video.muted = true
        setIsUnmuted(false)
      },
      { threshold: 0.15 },
    )

    observer.observe(video)

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [src])

  const handleUnmute = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    smoothPauseSpotifyPlayback()

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, SMOOTH_PAUSE_MS)
    })

    video.muted = false
    video.loop = true

    try {
      if (video.paused) {
        await video.play()
      }
      setIsUnmuted(true)
    } catch {
      video.muted = true
      setIsUnmuted(false)
      void startMutedPreview(video)
    }
  }, [])

  const handleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    setIsUnmuted(false)

    if (video.paused) {
      void startMutedPreview(video)
    }
  }, [])

  return (
    <figure className={styles.item}>
      <div className={styles.videoWrap} data-playing={isUnmuted ? 'true' : undefined}>
        <video
          ref={videoRef}
          src={src}
          className={styles.video}
          muted
          loop
          playsInline
          preload="metadata"
          draggable={false}
        />
        <button
          type="button"
          className={styles.videoControlButton}
          aria-label={isUnmuted ? 'Mute video' : 'Unmute video'}
          onClick={isUnmuted ? handleMute : handleUnmute}
        >
          <span className={styles.videoControlIcon} aria-hidden="true">
            {isUnmuted ? (
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
            ) : (
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
            )}
          </span>
        </button>
      </div>
    </figure>
  )
}

function pauseGalleryMedia(root: HTMLElement | null) {
  root?.querySelectorAll('video').forEach((video) => {
    video.pause()
    video.currentTime = 0
  })
}

export function ProjectGallery({ project, onBack }: ProjectGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null)

  const handleBack = useCallback(() => {
    pauseGalleryMedia(sectionRef.current)
    onBack()
  }, [onBack])

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label={`${project.title} gallery`}
    >
      <div className={styles.header}>
        <button type="button" className={styles.backButton} onClick={handleBack}>
          ← Back
        </button>
        <div className={styles.titles}>
          <h1 className={styles.title}>{project.title}</h1>
          <p className={styles.subtitle}>{project.subtitle}</p>
        </div>
      </div>

      {project.gallery.length > 0 ? (
        <div
          className={`${styles.grid}${
            project.galleryMaxColumns === 1
              ? ` ${styles.gridColumn}`
              : project.galleryMaxColumns === 3
                ? ` ${styles.gridMax3}`
                : ''
          }`}
        >
          {project.gallery.map((src, index) =>
            isVideoAsset(src) ? (
              <GalleryVideoItem key={`${project.id}-${index}`} src={src} />
            ) : (
              <figure key={`${project.id}-${index}`} className={styles.item}>
                <img
                  src={src}
                  alt=""
                  className={styles.image}
                  draggable={false}
                  loading={index < 2 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'low'}
                />
              </figure>
            ),
          )}
        </div>
      ) : (
        <p className={styles.empty}>Gallery coming soon.</p>
      )}
    </section>
  )
}
