import { useCallback, useEffect, useRef, useState } from 'react'
import type { PortfolioProject } from '../../data/portfolioProjects'
import { preloadProjectGallery } from '../../data/portfolioProjects'
import { isVideoAsset, startMutedPreview } from '../../lib/mediaUtils'
import { smoothPauseSpotifyPlayback, SMOOTH_PAUSE_MS } from '../../lib/spotifyPlayback'
import { NameMarquee } from '../NameMarquee'
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
  const audibleRef = useRef(false)
  const [isAudible, setIsAudible] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    void startMutedPreview(video)

    return () => {
      video.pause()
    }
  }, [src])

  const resumeMutedPreview = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.loop = true
    audibleRef.current = false
    setIsAudible(false)

    try {
      await video.play()
    } catch {
      /* preview blocked */
    }
  }, [])

  const handlePlay = useCallback(async () => {
    const video = videoRef.current
    if (!video) return

    if (!audibleRef.current) {
      smoothPauseSpotifyPlayback()

      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, SMOOTH_PAUSE_MS)
      })
    }

    video.pause()
    video.muted = false
    video.loop = false
    video.currentTime = 0
    audibleRef.current = true
    setIsAudible(true)

    try {
      await video.play()
    } catch {
      video.muted = true
      audibleRef.current = false
      setIsAudible(false)
      void resumeMutedPreview()
    }
  }, [resumeMutedPreview])

  const handlePause = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.muted = true
    video.loop = true
    audibleRef.current = false
    setIsAudible(false)
  }, [])

  const handleEnded = useCallback(() => {
    void resumeMutedPreview()
  }, [resumeMutedPreview])

  return (
    <figure className={styles.item}>
      <div className={styles.videoWrap} data-playing={isAudible ? 'true' : undefined}>
        <video
          ref={videoRef}
          src={src}
          className={styles.video}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          draggable={false}
          onEnded={handleEnded}
        />
        <button
          type="button"
          className={styles.videoControlButton}
          aria-label={isAudible ? 'Pause video' : 'Play video with sound'}
          onClick={isAudible ? handlePause : handlePlay}
        >
          <span className={styles.videoControlIcon} aria-hidden="true">
            {isAudible ? (
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

  useEffect(() => {
    preloadProjectGallery(project, true)
  }, [project])

  const handleBack = useCallback(() => {
    pauseGalleryMedia(sectionRef.current)
    onBack()
  }, [onBack])

  return (
    <div className={styles.page}>
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
          <div className={styles.grid}>
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
                    loading="eager"
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                  />
                </figure>
              ),
            )}
          </div>
        ) : (
          <p className={styles.empty}>Gallery coming soon.</p>
        )}
      </section>
      <NameMarquee />
    </div>
  )
}
