import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { useNativeScrollAnimations } from '../../lib/useNativeScrollAnimations'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useLiteMedia } from '../../lib/useLiteMedia'
import { pauseBackground, playBackground, prepareAutoplay } from '../../lib/autoplay'
// the MABLE film and its two strip slices, each with its grade baked in (no live CSS filters)
import introMp4 from '../../assets/mable-main.mp4'
import sliceAMp4 from '../../assets/mable-slice-a.mp4'
import sliceBMp4 from '../../assets/mable-slice-b.mp4'
import introPoster from '../../assets/mable-intro-poster.webp'
import styles from './FounderSection.module.css'

/**
 * Founder of MABLE, in the hero's language: the MABLE intro film (muted, gray) in a tall frame with a
 * contact-sheet strip beside it — a dark soft-focus slice and a narrow true one. As the section scrolls
 * in, the frame unveils from the bottom and settles; the strip slices drift up at their own speeds and
 * the words slide in quietly.
 */
export function FounderSection() {
  const ref = useRef<HTMLElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const reduced = useReducedMotion()
  // phones and tablets: the section is still (see below)
  const lite = useLiteMedia()
  // native scroll timeline where supported (see FounderSection.module.css); framer-motion otherwise
  // phones and tablets: all three films play, but as one still group. Nothing moves on its own
  // with the scroll and nothing pins: the frame and its strip scroll past together, like a picture
  // ("still" in FounderSection.module.css)
  const still = lite
  const native = useNativeScrollAnimations() && !still
  const js = !native && !still
  const { scrollYProgress } = useScroll(js ? { target: ref, offset: ['start end', 'end end'] } : undefined)
  // driven straight by the scroll (no spring), like the hero
  // natively animated: the JS formulas get a fixed value, so they never recompute while scrolling
  const idle = useMotionValue(1)
  const p = js ? scrollYProgress : idle
  const r = <T,>(from: T, to: T): [T, T] => (reduced ? [to, to] : [from, to])

  // the frame slides up into place and unveils, like the hero's opening
  const frameY = useTransform(p, [0, 0.5], r('18%', '0%'))
  // the unveil: a black cover slides up off the film (a transform, so the playing film isn't
  // repainted every frame the way an animated clip-path would)
  const coverY = useTransform(p, [0.05, 0.45], r('0%', '-101%'))
  const filmScale = useTransform(p, [0, 1], r(1.25, 1.05))
  // the strips rise past and settle level with the frame, so it ends as a clean contact sheet
  const stripA = useTransform(p, [0.1, 0.75], r('34%', '0%'))
  const stripB = useTransform(p, [0.1, 0.85], r('68%', '0%'))
  const stripOpacity = useTransform(p, [0.12, 0.4], r(0, 1))
  const textY = useTransform(p, [0.3, 0.7], r(40, 0))
  const textOpacity = useTransform(p, [0.3, 0.6], r(0, 1))

  useEffect(() => {
    const section = ref.current
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => !!v)
    if (!section || !videos.length) return
    const observer = new IntersectionObserver(
      ([entry]) => videos.forEach((v) => (entry.isIntersecting ? playBackground(v) : pauseBackground(v))),
      { threshold: 0.1 },
    )
    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const film = (i: number, className: string, src: string) => (
    <video
      ref={(el) => {
        videoRefs.current[i] = el
        if (el) prepareAutoplay(el)
      }}
      className={className}
      poster={i === 0 ? introPoster : undefined}
      autoPlay
      loop
      muted
      playsInline
      preload={i === 0 ? 'metadata' : 'none'}
      aria-hidden={i !== 0}
      aria-label={i === 0 ? 'MABLE studio intro film' : undefined}
      draggable={false}
    >
      <source src={src} type="video/mp4" />
    </video>
  )

  return (
    <section
      ref={ref}
      className={styles.section}
      data-css-scroll={native ? '' : undefined}
      data-still={still ? '' : undefined}
      aria-labelledby="founder-heading"
    >
      <div className={styles.pin}>
        <div className={styles.media}>
          <motion.div className={styles.frame} style={js ? { y: frameY } : undefined}>
            <motion.div className={styles.filmWrap} style={js ? { scale: filmScale } : undefined}>
              {film(0, styles.film, introMp4)}
            </motion.div>
            <motion.div className={styles.cover} style={js ? { y: coverY } : undefined} aria-hidden="true" />
          </motion.div>
          <motion.div className={`${styles.strip} ${styles.stripA}`} style={js ? { y: stripA, opacity: stripOpacity } : undefined} aria-hidden="true">
            {film(1, `${styles.film} ${styles.sliceA}`, sliceAMp4)}
          </motion.div>
          <motion.div className={`${styles.strip} ${styles.stripB}`} style={js ? { y: stripB, opacity: stripOpacity } : undefined} aria-hidden="true">
            {film(2, `${styles.film} ${styles.sliceB}`, sliceBMp4)}
          </motion.div>
        </div>

        <motion.div className={styles.text} style={js ? { y: textY, opacity: textOpacity } : undefined}>
          <p className={styles.label}>
            <span>Coming soon</span>
            <span>Founder of</span>
          </p>
          <h2 id="founder-heading" className={styles.heading}>
            <span className={styles.fit}>
              <span className={styles.bold}>MABLE</span> <span className={styles.light}>STUDIO</span>
            </span>
          </h2>
          <p className={styles.tag}>Design x code studio</p>
          <a className={styles.explore} href="https://mable.cc" target="_blank" rel="noopener noreferrer">
            <span>Explore</span>
            <span className={styles.exploreArrow} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
