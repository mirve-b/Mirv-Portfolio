import { useCallback, useEffect, useRef, useState } from 'react'
import type { PortfolioProject } from '../../data/portfolioProjects'
import { isVideoAsset, startMutedPreview } from '../../lib/mediaUtils'
import {
  pauseSpotifyPlayback,
  smoothPauseSpotifyPlayback,
} from '../../lib/spotifyPlayback'
import { useMuteVideoOnSpotifyPlay } from '../../lib/useMuteVideoOnSpotifyPlay'
import styles from './ProjectGallery.module.css'

type ProjectGalleryProps = {
  project: PortfolioProject
  onBack: () => void
}

type GalleryVideoItemProps = {
  src: string
  muteOnSpotifyPlay?: boolean
  /** Full-width muted loop — no crop, no mute control (e.g. UI/UX prototypes). */
  previewOnly?: boolean
}

function GalleryVideoItem({
  src,
  muteOnSpotifyPlay = false,
  previewOnly = false,
}: GalleryVideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const spotifyHandoffRef = useRef(false)
  const [isUnmuted, setIsUnmuted] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
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

  const handleMute = useCallback(() => {
    if (spotifyHandoffRef.current) return

    const video = videoRef.current
    if (!video) return

    video.muted = true
    setIsUnmuted(false)

    if (video.paused) {
      void startMutedPreview(video)
    }
  }, [])

  useMuteVideoOnSpotifyPlay(isUnmuted, handleMute, muteOnSpotifyPlay && !previewOnly)

  const handleUnmute = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    spotifyHandoffRef.current = true
    pauseSpotifyPlayback()
    smoothPauseSpotifyPlayback()

    video.muted = false
    video.loop = true
    setIsUnmuted(true)

    const finishHandoff = () => {
      window.setTimeout(() => {
        spotifyHandoffRef.current = false
      }, 600)
    }

    void video
      .play()
      .catch(() => {
        video.muted = true
        setIsUnmuted(false)
      })
      .finally(finishHandoff)
  }, [])

  return (
    <figure className={styles.item}>
      <div
        className={`${styles.videoWrap}${
          previewOnly ? ` ${styles.videoWrapPreview}` : ''
        }`}
        data-playing={!previewOnly && isUnmuted ? 'true' : undefined}
      >
        <video
          ref={videoRef}
          src={src}
          className={`${styles.video}${
            previewOnly ? ` ${styles.videoPreview}` : ''
          }`}
          loop
          playsInline
          muted={previewOnly || undefined}
          preload="metadata"
          draggable={false}
        />
        {!previewOnly ? (
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
        ) : null}
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

function galleryClassName(maxColumns?: number) {
  return `${styles.grid}${
    maxColumns === 1
      ? ` ${styles.gridColumn}`
      : maxColumns === 3
        ? ` ${styles.gridMax3}`
        : ''
  }`
}

function GalleryMediaGrid({
  projectId,
  items,
  maxColumns,
  startIndex = 0,
}: {
  projectId: string
  items: string[]
  maxColumns?: number
  startIndex?: number
}) {
  return (
    <div className={galleryClassName(maxColumns)}>
      {items.map((src, index) =>
        isVideoAsset(src) ? (
          <GalleryVideoItem
            key={`${projectId}-${startIndex + index}`}
            src={src}
            muteOnSpotifyPlay={projectId === 'frames' || projectId === 'somewhere-else'}
            previewOnly={projectId === 'doubleu'}
          />
        ) : (
          <figure key={`${projectId}-${startIndex + index}`} className={styles.item}>
            <img
              src={src}
              alt=""
              className={styles.image}
              draggable={false}
              loading={startIndex + index < 2 ? 'eager' : 'lazy'}
              decoding="async"
              fetchPriority={startIndex + index === 0 ? 'high' : 'low'}
            />
          </figure>
        ),
      )}
    </div>
  )
}

export function ProjectGallery({ project, onBack }: ProjectGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const hasSections =
    Boolean(project.gallerySections?.length) &&
    Boolean(project.sectionGalleries?.length) &&
    project.gallerySections!.length === project.sectionGalleries!.length

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

      {hasSections ? (
        <div className={styles.sections}>
          {project.gallerySections!.map((section, sectionIndex) => {
            const items = project.sectionGalleries![sectionIndex] ?? []
            if (items.length === 0) return null

            const startIndex = project.sectionGalleries!
              .slice(0, sectionIndex)
              .reduce((sum, list) => sum + list.length, 0)

            return (
              <div key={section.title} className={styles.gallerySection}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <GalleryMediaGrid
                  projectId={project.id}
                  items={items}
                  maxColumns={section.maxColumns ?? project.galleryMaxColumns}
                  startIndex={startIndex}
                />
              </div>
            )
          })}
        </div>
      ) : project.gallery.length > 0 ? (
        <GalleryMediaGrid
          projectId={project.id}
          items={project.gallery}
          maxColumns={project.galleryMaxColumns}
        />
      ) : (
        <p className={styles.empty}>Gallery coming soon.</p>
      )}
    </section>
  )
}
