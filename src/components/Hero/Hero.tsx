import { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SplitText } from '../SplitText'
import { useReducedMotion } from '../../lib/useReducedMotion'
import heroMp4 from '../../assets/hero.mp4'
import heroMov from '../../assets/hero.mov'
import heroPoster from '../../assets/hero-poster.webp'
import styles from './Hero.module.css'

type HeroProps = {
  active?: boolean
}

export function Hero({ active = true }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Scroll parallax on the video only; the titles stay put.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  })
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '8%'])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, reduced ? 1 : 1.2])


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
    <section ref={sectionRef} className={styles.hero} aria-label="Portfolio hero">
      <motion.div
        className={styles.imageWrap}
        initial={reduced ? false : { clipPath: 'inset(6% 4% 6% 4% round 18px)' }}
        animate={{ clipPath: 'inset(0% 0% 0% 0% round 0px)' }}
        transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.video
          ref={videoRef}
          className={styles.image}
          style={{ y: videoY, scale: videoScale }}
          initial={reduced ? false : { opacity: 0, filter: 'brightness(0.4) blur(6px)' }}
          animate={{ opacity: 1, filter: 'brightness(1) blur(0px)' }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
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
        </motion.video>

        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.titles}>
            <SplitText
              as="h1"
              text="MIRVÉ"
              className={styles.titleAccent}
              delay={0.45}
              stagger={0.08}
            />
            <SplitText
              as="p"
              text="2026 PORTFOLIO"
              className={styles.titleLight}
              delay={0.85}
              stagger={0.03}
            />
          </div>
        </div>
      </motion.div>
    </section>
  )
}
