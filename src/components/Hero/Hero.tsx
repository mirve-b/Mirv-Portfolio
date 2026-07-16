import { useEffect, useRef } from 'react'
import heroVideo from '../../assets/hero.mov'
import styles from './Hero.module.css'

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.preload = 'metadata'
    video.setAttribute('fetchpriority', 'high')

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {})
          return
        }
        video.pause()
      },
      { threshold: 0.15 },
    )

    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={styles.hero} aria-label="Portfolio hero">
      <div className={styles.imageWrap}>
        <video
          ref={videoRef}
          src={heroVideo}
          className={styles.image}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          aria-hidden="true"
          draggable={false}
        />

        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.titles}>
            <h1 className={styles.titleAccent}>MIRVÉ</h1>
            <p className={styles.titleLight}>2026 PORTFOLIO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
