import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import pfpImg from '../../assets/PFP.png'
import styles from './EntryPfp.module.css'

const slideSpring = { type: 'spring' as const, stiffness: 360, damping: 22 }
const bubbleSpring = { type: 'spring' as const, stiffness: 480, damping: 14 }
const HIDE_DELAY_MS = 3000

let shownThisPageLoad = false

type EntryPfpProps = {
  active: boolean
}

export function EntryPfp({ active }: EntryPfpProps) {
  const hasAnimatedIn = useRef(false)
  const [mounted] = useState(() => !shownThisPageLoad)
  const [onScreen, setOnScreen] = useState(true)
  const [revealed, setRevealed] = useState(false)
  const [showBubble, setShowBubble] = useState(false)

  useEffect(() => {
    if (!active || !mounted) return

    shownThisPageLoad = true

    const revealTimer = window.setTimeout(() => {
      setRevealed(true)
    }, 500)

    return () => window.clearTimeout(revealTimer)
  }, [active, mounted])

  useEffect(() => {
    if (!showBubble) return

    const hideTimer = window.setTimeout(() => {
      setShowBubble(false)
      setRevealed(false)
    }, HIDE_DELAY_MS)

    return () => window.clearTimeout(hideTimer)
  }, [showBubble])

  if (!active || !mounted || !onScreen) return null

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
