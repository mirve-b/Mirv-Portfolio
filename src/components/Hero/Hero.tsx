import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { useNativeScrollAnimations } from '../../lib/useNativeScrollAnimations'
import { useReducedMotion } from '../../lib/useReducedMotion'
// right-sized copies of the hero film, each with its look baked in (no live CSS filters on video)
import heroMp4 from '../../assets/hero-main.mp4'
import sliceAMp4 from '../../assets/hero-slice-a.mp4'
import sliceBMp4 from '../../assets/hero-slice-b.mp4'
import heroMov from '../../assets/hero.mov'
import heroPoster from '../../assets/hero-poster.webp'
import styles from './Hero.module.css'

type HeroProps = {
  active?: boolean
}

/**
 * The landing frame: the hero film in a big frame with a strip of narrow panels beside it, like a
 * contact sheet. The section pins while you scroll: the frame pulls back, the film
 * pushes in, and the strip panels rise past at their own speeds.
 */
export function Hero({ active = true }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const reduced = useReducedMotion()

  // where the browser can run scroll-linked animations natively, the CSS in Hero.module.css does
  // the scroll effects (off the main thread: smooth on phones) and framer-motion stays out of it
  const native = useNativeScrollAnimations()
  const js = !native

  // framer only tracks the hero's scroll when it's the one animating it (no measuring otherwise)
  const { scrollYProgress } = useScroll(js ? { target: sectionRef, offset: ['start start', 'end end'] } : undefined)
  // the scroll position drives everything directly (no spring): the effects track the finger
  // exactly on phones, and stop the moment scrolling stops
  // natively animated: the JS formulas get a fixed value, so they never recompute while scrolling
  const idle = useMotionValue(0)
  const p = js ? scrollYProgress : idle
  // with reduced motion every range collapses to its resting value
  const r = <T,>(from: T, to: T): [T, T] => (reduced ? [from, from] : [from, to])

  const frameScale = useTransform(p, [0, 1], r(1, 0.9))
  const filmScale = useTransform(p, [0, 1], r(1.08, 1.32))
  const filmY = useTransform(p, [0, 1], r('0%', '-6%'))
  const stripA = useTransform(p, [0, 1], r('0%', '-38%'))
  const stripB = useTransform(p, [0, 1], r('0%', '-72%'))
  const copyY = useTransform(p, [0.1, 0.7], r('0%', '-60%'))
  const logoY = useTransform(p, [0.1, 1], r('0%', '-140%'))
  // the wordmark is gone by the time the top bar slides in
  // it stays solid for the first stretch of scroll (phones scroll the short hero quickly)
  const logoOpacity = useTransform(p, [0.14, 0.4], r(1, 0))
  const copyOpacity = useTransform(p, [0.18, 0.55], r(1, 0))

  useEffect(() => {
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => !!v)
    if (!active) {
      videos.forEach((v) => v.pause())
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => videos.forEach((v) => (entry.isIntersecting ? void v.play().catch(() => {}) : v.pause())),
      { threshold: 0.05 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [active])

  const film = (i: number, className: string, src: string) => (
    <video
      ref={(el) => {
        videoRefs.current[i] = el
      }}
      className={className}
      poster={i === 0 ? heroPoster : undefined}
      autoPlay
      loop
      muted
      playsInline
      preload={i === 0 ? 'auto' : 'metadata'}
      aria-hidden="true"
      draggable={false}
    >
      <source src={src} type="video/mp4" />
      {i === 0 ? <source src={heroMov} type="video/quicktime" /> : null}
    </video>
  )

  return (
    <section
      ref={sectionRef}
      className={styles.hero}
      data-css-scroll={native ? '' : undefined}
      aria-label="Portfolio hero"
    >
      <div className={styles.pin}>
        <div className={styles.frameCell}>
          <motion.div
            className={styles.frame}
            style={js ? { scale: frameScale } : undefined}
          >
            <motion.div className={styles.filmWrap} style={js ? { scale: filmScale, y: filmY } : undefined}>
              {film(0, styles.film, heroMp4)}
            </motion.div>

            <motion.div className={styles.copy} style={js ? { y: copyY, opacity: copyOpacity } : undefined}>
              <p className={styles.year}>2026</p>
              <p className={styles.line}>
                Part engineer, part
                <br />
                illustrator, entirely curious
              </p>
            </motion.div>

          </motion.div>

          {/* the wordmark, sitting across the frame's top-left edge */}
          <motion.h1
            className={styles.logo}
            style={js ? { y: logoY, opacity: logoOpacity } : undefined}
            aria-label="Mirvé portfolio"
          >
            <span className={styles.logoScript} aria-hidden="true">
              M
            </span>
            <span className={styles.logoWord} aria-hidden="true">
              <span className={styles.logoName}>IRVÉ</span>
              <span className={styles.logoSub}>Portfolio</span>
            </span>
          </motion.h1>
        </div>

        {/* the contact-sheet strip: slices of the same film, rising at their own pace */}
        <motion.div className={`${styles.strip} ${styles.stripA}`} style={js ? { y: stripA } : undefined} aria-hidden="true">
          {film(1, `${styles.film} ${styles.filmSliceA}`, sliceAMp4)}
          <span className={styles.stripTag}>
            Designer x <br />
            engineer
          </span>
        </motion.div>
        <motion.div className={`${styles.strip} ${styles.stripB}`} style={js ? { y: stripB } : undefined} aria-hidden="true">
          {film(2, `${styles.film} ${styles.filmSliceB}`, sliceBMp4)}
        </motion.div>
      </div>
    </section>
  )
}
