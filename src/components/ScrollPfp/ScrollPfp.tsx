import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import pfpImg from '../../assets/PFP.webp'
import { useIsMobile } from '../../lib/useIsMobile'
import styles from './ScrollPfp.module.css'

const slideSpring = { type: 'spring' as const, stiffness: 360, damping: 24 }
const bubbleSpring = { type: 'spring' as const, stiffness: 480, damping: 14 }
const MIN_SCROLL_TO_REVEAL_PX = 80
const SCROLL_UP_HIDE_PX = 40

type ScrollPfpProps = {
  zoneRef: RefObject<HTMLElement | null>
}

function footerInView(zone: HTMLElement, mobile: boolean) {
  const rect = zone.getBoundingClientRect()
  const vh = window.innerHeight

  if (mobile) {
    // Show while the top of the footer is meaningfully on screen.
    return rect.top < vh * 0.85 && rect.top > vh * -0.15
  }

  return rect.top < vh * 0.7 && rect.bottom > vh * 0.22
}

function canShow(zone: HTMLElement, mobile: boolean) {
  if (window.scrollY < MIN_SCROLL_TO_REVEAL_PX) return false
  return footerInView(zone, mobile)
}

type FigureContentProps = {
  revealed: boolean
  showBubble: boolean
}

function FigureContent({ revealed, showBubble }: FigureContentProps) {
  return (
    <>
      <AnimatePresence>
        {showBubble && revealed ? (
          <motion.div
            className={styles.bubble}
            initial={{ opacity: 0, scale: 0.75, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={bubbleSpring}
          >
            <span>Bring Coke.</span>
            <span>I&apos;ll bring the ideas!</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <img src={pfpImg} alt="" className={styles.pfp} draggable={false} />
    </>
  )
}

export function ScrollPfp({ zoneRef }: ScrollPfpProps) {
  const lastScrollY = useRef(0)
  const scrollUpAccum = useRef(0)
  const revealedRef = useRef(false)
  const isMobile = useIsMobile()
  const [revealed, setRevealed] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  const hide = useCallback(() => {
    if (!revealedRef.current) return
    revealedRef.current = false
    scrollUpAccum.current = 0
    setShowBubble(false)
    setRevealed(false)
  }, [])

  const reveal = useCallback(() => {
    scrollUpAccum.current = 0
    if (revealedRef.current) return
    revealedRef.current = true
    setRevealed(true)
  }, [])

  const handleSlideComplete = useCallback(() => {
    if (revealedRef.current) setShowBubble(true)
  }, [])

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    lastScrollY.current = window.scrollY

    const sync = () => {
      const zoneEl = zoneRef.current
      if (!zoneEl) return

      if (!canShow(zoneEl, isMobile)) {
        hide()
        lastScrollY.current = window.scrollY
        return
      }

      const currentY = window.scrollY
      const delta = lastScrollY.current - currentY

      if (delta > 1) {
        scrollUpAccum.current += delta
        if (scrollUpAccum.current >= SCROLL_UP_HIDE_PX) {
          hide()
        }
      } else {
        scrollUpAccum.current = 0
        reveal()
      }

      lastScrollY.current = currentY
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && canShow(zone, isMobile)) {
          reveal()
          return
        }
        hide()
      },
      isMobile
        ? { threshold: [0, 0.08], rootMargin: '0px 0px -8% 0px' }
        : { threshold: [0.12, 0.22], rootMargin: '0px 0px -28% 0px' },
    )

    observer.observe(zone)
    window.addEventListener('scroll', sync, { passive: true })
    sync()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', sync)
    }
  }, [zoneRef, hide, reveal, isMobile])

  return (
    <div
      className={`${styles.root}${isMobile ? ` ${styles.rootMobile}` : ''}`}
      aria-hidden={!revealed}
    >
      <motion.div
        className={styles.figureWrap}
        initial={false}
        animate={{ y: revealed ? 0 : '110%' }}
        transition={slideSpring}
        onAnimationComplete={handleSlideComplete}
      >
        <FigureContent revealed={revealed} showBubble={showBubble} />
      </motion.div>
    </div>
  )
}
