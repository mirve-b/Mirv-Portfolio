import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { useNativeScrollAnimations } from '../../lib/useNativeScrollAnimations'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useLiteMedia } from '../../lib/useLiteMedia'
import { pauseBackground, playBackground, prepareAutoplay } from '../../lib/autoplay'
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
  // phones and low-powered devices play only the main film; the strip is a plain dark panel
  const lite = useLiteMedia()

  // Safari (every iPhone browser) runs scroll-linked animations on the main thread, apart from the
  // scroll itself, so they update in steps and the hero trembles. There the hero eases toward the
  // scroll position instead (see "follow" in Hero.module.css): smooth, a touch of glide.
  const [webkit] = useState(() => typeof window !== 'undefined' && 'GestureEvent' in window)
  // phones and low-powered devices: the hero is simply still. The film plays, nothing pins or
  // moves, and the page scrolls past it normally ("still" in Hero.module.css)
  const still = lite
  const follow = webkit && !reduced && !still
  // elsewhere, where the browser can run them natively, the CSS in Hero.module.css does the scroll
  // effects (off the main thread) and framer-motion stays out of it
  const native = useNativeScrollAnimations() && !follow && !still
  const js = !native && !follow && !still

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

  // follow mode: hand the scroll progress to CSS as --p (it only changes inside the pinned stretch)
  useEffect(() => {
    const section = sectionRef.current
    if (!follow || !section) return
    const pin = section.firstElementChild as HTMLElement
    let raf = 0
    let last = -1
    const update = () => {
      raf = 0
      // measured against the pin's own height (100svh), not the window: Safari's toolbar sliding
      // away changes the window's height mid-scroll, and that would make the effects jump
      const stretch = section.offsetHeight - pin.offsetHeight
      const top = section.getBoundingClientRect().top
      const p = stretch > 0 ? Math.min(1, Math.max(0, -top / stretch)) : 0
      const rounded = Math.round(p * 1000) / 1000
      if (rounded !== last) {
        last = rounded
        section.style.setProperty('--p', String(rounded))
      }
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [follow])

  useEffect(() => {
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => !!v)
    if (!active) {
      videos.forEach(pauseBackground)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => videos.forEach((v) => (entry.isIntersecting ? playBackground(v) : pauseBackground(v))),
      { threshold: 0.05 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [active])

  const film = (i: number, className: string, src: string) =>
    lite && i !== 0 ? null : (
    <video
      ref={(el) => {
        videoRefs.current[i] = el
        if (el) prepareAutoplay(el)
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
      data-follow={follow ? '' : undefined}
      data-still={still ? '' : undefined}
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
