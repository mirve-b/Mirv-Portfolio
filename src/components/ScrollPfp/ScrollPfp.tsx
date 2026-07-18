import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import pfpImg from '../../assets/PFP.webp'
import { useIsMobile } from '../../lib/useIsMobile'
import styles from './ScrollPfp.module.css'

const slideSpring = { type: 'spring' as const, stiffness: 360, damping: 22 }
const bubbleSpring = { type: 'spring' as const, stiffness: 480, damping: 14 }
const MOBILE_MQ = '(max-width: 768px)'
const SCROLL_UP_HIDE_DELAY_MS = 320
const SCROLL_UP_DISTANCE_PX = 48

type ScrollPfpProps = {
  zoneRef: RefObject<HTMLElement | null>
  mobileNameInputRef?: RefObject<HTMLInputElement | null>
}

function clearPositionStyles(root: HTMLElement) {
  root.style.bottom = ''
  root.style.right = ''
  root.style.left = ''
  root.style.top = ''
  root.style.transform = ''
}

function isZoneInView(zone: HTMLElement, mobile: boolean) {
  const rect = zone.getBoundingClientRect()
  const margin = mobile ? window.innerHeight * 0.12 : window.innerHeight * 0.08
  return rect.top < window.innerHeight - margin && rect.bottom > 0
}

function useMobilePosition(
  rootRef: RefObject<HTMLDivElement | null>,
  nameInputRef: RefObject<HTMLInputElement | null> | undefined,
  zoneRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const media = window.matchMedia(MOBILE_MQ)
    let raf = 0

    const apply = () => {
      raf = 0
      if (!media.matches || !active || !nameInputRef?.current || !root) return

      const rect = nameInputRef.current.getBoundingClientRect()
      const container = zoneRef.current?.firstElementChild as HTMLElement | null
      const paddingRight = container
        ? Number.parseFloat(getComputedStyle(container).paddingRight) || 16
        : 16

      root.style.bottom = `${window.innerHeight - rect.top}px`
      root.style.right = `${paddingRight}px`
      root.style.left = 'auto'
      root.style.top = 'auto'
      root.style.transform = 'none'
    }

    const schedule = () => {
      if (raf) return
      raf = window.requestAnimationFrame(apply)
    }

    if (media.matches && active) {
      apply()
    } else if (root) {
      clearPositionStyles(root)
    }

    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', schedule, { passive: true })
    media.addEventListener('change', schedule)

    const input = nameInputRef?.current
    const resizeObserver =
      active && input && typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(schedule)
        : null
    if (input && resizeObserver) resizeObserver.observe(input)

    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', schedule)
      media.removeEventListener('change', schedule)
      resizeObserver?.disconnect()
      if (root) clearPositionStyles(root)
    }
  }, [rootRef, nameInputRef, zoneRef, active])
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
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
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

export function ScrollPfp({ zoneRef, mobileNameInputRef }: ScrollPfpProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const zoneInView = useRef(false)
  const scrollUpStartedAt = useRef<number | null>(null)
  const scrollUpAccum = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMobile = useIsMobile()
  const [revealed, setRevealed] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [layoutMode, setLayoutMode] = useState<'mobile' | 'desktop'>(() =>
    typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
      ? 'mobile'
      : 'desktop',
  )

  const hide = useCallback(() => {
    setShowBubble(false)
    setRevealed(false)
  }, [])

  const reveal = useCallback(() => {
    setRevealed(true)
  }, [])

  const cancelHideSchedule = useCallback(() => {
    scrollUpStartedAt.current = null
    scrollUpAccum.current = 0
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
  }, [])

  const scheduleHideAfterScrollUp = useCallback(() => {
    if (hideTimer.current) return

    if (scrollUpStartedAt.current === null) {
      scrollUpStartedAt.current = performance.now()
    }

    const elapsed = performance.now() - scrollUpStartedAt.current
    const remaining = Math.max(0, SCROLL_UP_HIDE_DELAY_MS - elapsed)

    hideTimer.current = setTimeout(() => {
      hideTimer.current = null
      scrollUpStartedAt.current = null
      hide()
    }, remaining)
  }, [hide])

  const handleSlideComplete = useCallback(() => {
    if (revealed) setShowBubble(true)
  }, [revealed])

  useLayoutEffect(() => {
    const root = rootRef.current
    const zone = zoneRef.current
    const nextMode = isMobile ? 'mobile' : 'desktop'

    if (root) clearPositionStyles(root)

    if (zone) {
      const inView = isZoneInView(zone, isMobile)
      zoneInView.current = inView

      if (inView) {
        reveal()
      } else {
        hide()
      }
    }

    setLayoutMode((current) => (current === nextMode ? current : nextMode))
  }, [isMobile, zoneRef, hide, reveal])

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    lastScrollY.current = window.scrollY

    const onScroll = () => {
      if (isMobile && zoneInView.current) {
        lastScrollY.current = window.scrollY
        return
      }

      const currentY = window.scrollY
      const delta = lastScrollY.current - currentY

      if (delta > 1) {
        scrollUpAccum.current += delta

        if (scrollUpAccum.current >= SCROLL_UP_DISTANCE_PX) {
          cancelHideSchedule()
          hide()
        } else {
          scheduleHideAfterScrollUp()
        }
      } else if (delta < -1) {
        cancelHideSchedule()
      }

      lastScrollY.current = currentY
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        zoneInView.current = entry.isIntersecting

        if (entry.isIntersecting) {
          cancelHideSchedule()
          reveal()
          return
        }

        if (isMobile) hide()
      },
      isMobile
        ? { threshold: 0.05, rootMargin: '0px 0px 12% 0px' }
        : { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(zone)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelHideSchedule()
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [zoneRef, hide, reveal, cancelHideSchedule, scheduleHideAfterScrollUp, isMobile])

  useMobilePosition(
    rootRef,
    mobileNameInputRef,
    zoneRef,
    isMobile && revealed,
  )

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${isMobile ? ` ${styles.rootMobile}` : ''}`}
      aria-hidden={!revealed}
    >
      {layoutMode === 'mobile' ? (
        <div
          key="mobile-figure"
          className={`${styles.figureWrap} ${styles.figureWrapMobile}`}
          data-revealed={revealed ? '' : undefined}
          onTransitionEnd={(event) => {
            if (event.propertyName === 'transform') handleSlideComplete()
          }}
        >
          <FigureContent revealed={revealed} showBubble={showBubble} />
        </div>
      ) : (
        <motion.div
          key="desktop-figure"
          className={styles.figureWrap}
          initial={false}
          animate={{ y: revealed ? 0 : '100%' }}
          transition={slideSpring}
          onAnimationComplete={handleSlideComplete}
        >
          <FigureContent revealed={revealed} showBubble={showBubble} />
        </motion.div>
      )}
    </div>
  )
}
