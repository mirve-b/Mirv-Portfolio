import { useEffect, useRef } from 'react'
import heroMp4 from '../../assets/hero.mp4'
import heroMov from '../../assets/hero.mov'
import heroPoster from '../../assets/hero-poster.webp'
import styles from './Hero.module.css'

type HeroProps = {
  active?: boolean
}

export function Hero({ active = true }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (!active) {
      video.pause()
      return
    }

    video.preload = 'auto'
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
  }, [active])

  return (
    <section className={styles.hero} aria-label="Portfolio hero">
      <div className={styles.imageWrap}>
        <video
          ref={videoRef}
          className={styles.image}
          poster={heroPoster}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          draggable={false}
        >
          <source src={heroMp4} type="video/mp4" />
          <source src={heroMov} type="video/quicktime" />
        </video>

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
