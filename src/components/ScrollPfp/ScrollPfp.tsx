import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import pfpImg from '../../assets/PFP.png'
import styles from './ScrollPfp.module.css'

const slideSpring = { type: 'spring' as const, stiffness: 360, damping: 22 }
const bubbleSpring = { type: 'spring' as const, stiffness: 480, damping: 14 }

type ScrollPfpProps = {
  zoneRef: RefObject<HTMLElement | null>
}

export function ScrollPfp({ zoneRef }: ScrollPfpProps) {
  const lastScrollY = useRef(0)
  const [revealed, setRevealed] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  const hide = useCallback(() => {
    setRevealed(false)
    setShowBubble(false)
  }, [])

  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return

    lastScrollY.current = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      if (currentY < lastScrollY.current - 2) hide()
      lastScrollY.current = currentY
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setRevealed(true)
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(zone)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [zoneRef, hide])

  return (
    <div className={styles.root} aria-hidden={!revealed}>
      <motion.div
        className={styles.figureWrap}
        initial={false}
        animate={{ y: revealed ? 0 : '100%' }}
        transition={slideSpring}
        onAnimationComplete={() => {
          if (revealed) setShowBubble(true)
        }}
      >
        <img
          src={pfpImg}
          alt=""
          className={styles.pfp}
          draggable={false}
        />

        <AnimatePresence>
          {showBubble ? (
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
      </motion.div>
    </div>
  )
}
