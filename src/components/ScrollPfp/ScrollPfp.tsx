import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import pfpImg from '../../assets/PFP.png'
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

function useMobilePosition(
  rootRef: RefObject<HTMLDivElement | null>,
  nameInputRef: RefObject<HTMLInputElement | null> | undefined,
  zoneRef: RefObject<HTMLElement | null>,
  active: boolean,
) {
  useLayoutEffect(() => {
    const media = window.matchMedia(MOBILE_MQ)
    let raf = 0

    const apply = () => {
      raf = 0
      const root = rootRef.current
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

    apply()
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
  const scrollUpStartedAt = useRef<number | null>(null)
  const scrollUpAccum = useRef(0)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isMobile = useIsMobile()
  const [revealed, setRevealed] = useState(false)
  const [showBubble, setShowBubble] = useState(false)
  const [positionReady, setPositionReady] = useState(false)

  const hide = useCallback(() => {
    setShowBubble(false)
    setRevealed(false)
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

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    lastScrollY.current = window.scrollY

    const onScroll = () => {
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
        if (entry.isIntersecting) {
          cancelHideSchedule()
          setPositionReady(true)
          setRevealed(true)
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(zone)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelHideSchedule()
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [zoneRef, hide, cancelHideSchedule, scheduleHideAfterScrollUp])

  useMobilePosition(
    rootRef,
    mobileNameInputRef,
    zoneRef,
    isMobile && positionReady,
  )

  return (
    <div
      ref={rootRef}
      className={`${styles.root}${isMobile ? ` ${styles.rootMobile}` : ''}`}
      aria-hidden={!revealed}
    >
      {isMobile ? (
        <div
          className={`${styles.figureWrap} ${styles.figureWrapMobile}`}
          data-revealed={revealed ? '' : undefined}
          onTransitionEnd={(event) => {
            if (event.propertyName === 'transform') handleSlideComplete()
          }}
        >
          <FigureContent
            revealed={revealed}
            showBubble={showBubble}
          />
        </div>
      ) : (
        <motion.div
          className={styles.figureWrap}
          initial={false}
          animate={{ y: revealed ? 0 : '100%' }}
          transition={slideSpring}
          onAnimationComplete={handleSlideComplete}
        >
          <FigureContent
            revealed={revealed}
            showBubble={showBubble}
          />
        </motion.div>
      )}
    </div>
  )
}
