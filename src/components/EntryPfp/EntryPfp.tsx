import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import pfpImg from '../../assets/PFP.webp'
import { hasSeenEntryPfp, markEntryPfpSeen } from '../../lib/introStorage'
import styles from './EntryPfp.module.css'

const slideSpring = { type: 'spring' as const, stiffness: 360, damping: 22 }
const bubbleSpring = { type: 'spring' as const, stiffness: 480, damping: 14 }
const HIDE_DELAY_MS = 3000

type EntryPfpProps = {
  active: boolean
}

export function EntryPfp({ active }: EntryPfpProps) {
  const hasAnimatedIn = useRef(false)
  const sessionDone = useRef(hasSeenEntryPfp())
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastScrollY = useRef(0)
  const [animating, setAnimating] = useState(false)
  const [onScreen, setOnScreen] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  const hide = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current)
      hideTimer.current = null
    }
    setShowBubble(false)
    setRevealed(false)
  }, [])

  useEffect(() => {
    if (!active) {
      if (sessionDone.current) {
        setAnimating(false)
        setOnScreen(false)
      }
      return
    }

    if (sessionDone.current) return

    sessionDone.current = true
    markEntryPfpSeen()
    setAnimating(true)

    const revealTimer = window.setTimeout(() => {
      setRevealed(true)
    }, 500)

    return () => window.clearTimeout(revealTimer)
  }, [active])

  useEffect(() => {
    if (!showBubble) return

    hideTimer.current = window.setTimeout(() => {
      hideTimer.current = null
      hide()
    }, HIDE_DELAY_MS)

    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
    }
  }, [showBubble, hide])

  useEffect(() => {
    if (!active || !animating || !onScreen) return

    lastScrollY.current = window.scrollY

    const onScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current + 2) hide()
      lastScrollY.current = currentY
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [active, animating, onScreen, hide])

  if (!active || (sessionDone.current && !animating) || !onScreen) return null

  return (
    <div className={styles.root} aria-hidden={!revealed}>
      <motion.div
        className={styles.figureWrap}
        initial={false}
        animate={{ y: revealed ? 0 : '-100%' }}
        transition={slideSpring}
        onAnimationComplete={() => {
          if (revealed) {
            hasAnimatedIn.current = true
            setShowBubble(true)
            return
          }

          if (hasAnimatedIn.current) setOnScreen(false)
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
              initial={{ opacity: 0, scale: 0.75, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={bubbleSpring}
            >
              <span className={styles.bubbleText}>
                You&apos;ve found me!!
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
