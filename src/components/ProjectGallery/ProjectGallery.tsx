import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
  onOpen?: (src: string) => void
}

function GalleryVideoItem({
  src,
  muteOnSpotifyPlay = false,
  previewOnly = false,
  onOpen,
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
    <figure
      className={`${styles.item}${onOpen ? ` ${styles.itemOpenable}` : ''}`}
      onClick={onOpen ? () => onOpen(src) : undefined}
      onKeyDown={
        onOpen
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onOpen(src)
              }
            }
          : undefined
      }
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? 'View artwork' : undefined}
    >
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
            onClick={(event) => {
              event.stopPropagation()
              if (isUnmuted) {
                handleMute()
                return
              }
              handleUnmute()
            }}
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

function galleryClassName(
  maxColumns?: number,
  layout?: PortfolioProject['galleryLayout'],
) {
  if (layout === 'pack') return `${styles.grid} ${styles.gridPack}`

  return `${styles.grid}${
    maxColumns === 1
      ? ` ${styles.gridColumn}`
      : maxColumns === 3
        ? ` ${styles.gridMax3}`
        : ''
  }`
}

function ArtworkLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const video = isVideoAsset(src)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <div className={styles.lightbox} onClick={onClose} role="presentation">
      <button
        type="button"
        className={styles.lightboxClose}
        aria-label="Close artwork"
        onClick={onClose}
      >
        ×
      </button>
      <div
        className={styles.lightboxCard}
        role="dialog"
        aria-modal="true"
        aria-label="Artwork"
        onClick={(event) => event.stopPropagation()}
      >
        {video ? (
          <video
            src={src}
            className={styles.lightboxMedia}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
          />
        ) : (
          <img src={src} alt="" className={styles.lightboxMedia} draggable={false} />
        )}
      </div>
    </div>,
    document.body,
  )
}

function GalleryMediaGrid({
  projectId,
  items,
  maxColumns,
  layout,
  onOpenArtwork,
}: {
  projectId: string
  items: string[]
  maxColumns?: number
  layout?: PortfolioProject['galleryLayout']
  onOpenArtwork?: (src: string) => void
}) {
  return (
    <div className={galleryClassName(maxColumns, layout)}>
      {items.map((src, index) =>
        isVideoAsset(src) ? (
          <GalleryVideoItem
            key={`${projectId}-${index}`}
            src={src}
            muteOnSpotifyPlay={projectId === 'frames'}
            previewOnly={
              projectId === 'doubleu' ||
              projectId === 'somewhere-else' ||
              projectId === 'molly'
            }
            onOpen={onOpenArtwork}
          />
        ) : (
          <figure
            key={`${projectId}-${index}`}
            className={`${styles.item}${onOpenArtwork ? ` ${styles.itemOpenable}` : ''}`}
            onClick={onOpenArtwork ? () => onOpenArtwork(src) : undefined}
            onKeyDown={
              onOpenArtwork
                ? (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onOpenArtwork(src)
                    }
                  }
                : undefined
            }
            role={onOpenArtwork ? 'button' : undefined}
            tabIndex={onOpenArtwork ? 0 : undefined}
            aria-label={onOpenArtwork ? 'View artwork' : undefined}
          >
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
  )
}

export function ProjectGallery({ project, onBack }: ProjectGalleryProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const [openArtwork, setOpenArtwork] = useState<string | null>(null)
  const canOpenArtwork = project.category === 'art'

  const handleBack = useCallback(() => {
    pauseGalleryMedia(sectionRef.current)
    onBack()
  }, [onBack])

  const handleOpenArtwork = useCallback((src: string) => {
    setOpenArtwork(src)
  }, [])

  const handleCloseArtwork = useCallback(() => {
    setOpenArtwork(null)
  }, [])

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
        <GalleryMediaGrid
          projectId={project.id}
          items={project.gallery}
          maxColumns={project.galleryMaxColumns}
          layout={project.galleryLayout}
          onOpenArtwork={canOpenArtwork ? handleOpenArtwork : undefined}
        />
      ) : (
        <p className={styles.empty}>Gallery coming soon.</p>
      )}

      {openArtwork ? (
        <ArtworkLightbox src={openArtwork} onClose={handleCloseArtwork} />
      ) : null}
    </section>
  )
}
