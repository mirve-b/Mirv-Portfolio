import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import artImg from '../../assets/Notes/art.webp'
import decoImg from '../../assets/Collage/deco.webp'
import devImg from '../../assets/Notes/dev.webp'
import fileBackImg from '../../assets/Collage/BACK.webp'
import fileFrontImg from '../../assets/Collage/FRONT.webp'
import paperImg from '../../assets/Collage/paper.webp'
import pinkPolkaImg from '../../assets/Collage/pink polka.webp'
import whitePolkaImg from '../../assets/Collage/white polka.webp'
import paperclipImg from '../../assets/Collage/PaperClip.webp'
import uiUxImg from '../../assets/Notes/ui_ux.webp'
import { useIsMobile } from '../../lib/useIsMobile'
import { useReducedMotion } from '../../lib/useReducedMotion'
import type { ExpertiseCategory } from '../../lib/pageNavigation'
import { assembleItem, staggerContainer } from '../../lib/motion'
import { CollageBlackPage } from './CollageBlackPage'
import { CollageOrchid } from './CollageOrchid'
import styles from './AboutSection.module.css'

const SKILL_LINKS = [
  { id: 'art' as const, label: 'Art portfolio', image: artImg, className: styles.noteArt },
  { id: 'ui-ux' as const, label: 'UI and UX work', image: uiUxImg, className: styles.noteUiUx },
  { id: 'development' as const, label: 'Development work', image: devImg, className: styles.noteDev },
] as const

type FolderPhase = 'idle' | 'open' | 'closing'

const bubblePopIn = {
  type: 'spring' as const,
  stiffness: 720,
  damping: 12,
  mass: 0.55,
}

const bubblePopOut = {
  type: 'spring' as const,
  stiffness: 640,
  damping: 18,
  mass: 0.5,
}

const exploreBubbleMotion = {
  initial: { opacity: 0, scale: 0.2, x: '-50%', y: 22 },
  animate: { opacity: 1, scale: 1, x: '-50%', y: 0 },
  exit: {
    opacity: 0,
    scale: 0.25,
    x: '-50%',
    y: 18,
    transition: bubblePopOut,
  },
}

const selectBubbleMotion = {
  initial: { opacity: 0, scale: 0.2, x: '-50%', y: 20 },
  animate: { opacity: 1, scale: 1, x: '-50%', y: 0 },
  exit: {
    opacity: 0,
    scale: 0.3,
    x: '-50%',
    y: -10,
    transition: bubblePopOut,
  },
}

type SkillsCollageProps = {
  onSelectCategory: (category: ExpertiseCategory) => void
  isHomeActive: boolean
}

function SkillsCollage({ onSelectCategory, isHomeActive }: SkillsCollageProps) {
  const collageRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  // tap to open, not hover, on any touch screen (an iPad's width gets the desktop layout, but it
  // has no mouse: its tap fakes a hover that opened the folder and then hit a note underneath)
  const [touch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches,
  )
  const tapMode = isMobile || touch
  // a tap that opens the folder must never also pick a note
  const openedAt = useRef(0)
  const [folderPhase, setFolderPhase] = useState<FolderPhase>('idle')
  // the pieces wait off-stage until the collage scrolls into view, then lay themselves down
  const reducedMotion = useReducedMotion()
  const [intro, setIntro] = useState<'wait' | 'play'>(() => (reducedMotion ? 'play' : 'wait'))

  useEffect(() => {
    const el = collageRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIntro('play')
        observer.disconnect()
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const openFolder = useCallback(() => {
    openedAt.current = performance.now()
    setFolderPhase('open')
  }, [])

  const closeFolder = useCallback(() => {
    setFolderPhase((phase) => (phase === 'open' ? 'closing' : phase))
  }, [])

  const handleAssetTap = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      if (!tapMode || folderPhase !== 'idle') return
      event.stopPropagation()
      openFolder()
    },
    [folderPhase, tapMode, openFolder],
  )

  const handleNoteSelect = useCallback(
    (category: ExpertiseCategory) => {
      if (performance.now() - openedAt.current < 450) return
      onSelectCategory(category)
      closeFolder()
    },
    [closeFolder, onSelectCategory],
  )

  const handleNoteTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLButtonElement>) => {
      if (event.propertyName !== 'transform') return
      if (folderPhase !== 'closing') return
      if (!event.currentTarget.classList.contains(styles.noteDev)) return
      setFolderPhase('idle')
    },
    [folderPhase],
  )

  useEffect(() => {
    if (folderPhase !== 'closing') return

    const resetTimer = window.setTimeout(() => {
      setFolderPhase('idle')
    }, 900)

    return () => window.clearTimeout(resetTimer)
  }, [folderPhase])

  useEffect(() => {
    if (isHomeActive) return
    setFolderPhase((phase) => (phase === 'open' ? 'closing' : phase))
  }, [isHomeActive])

  useEffect(() => {
    if (!tapMode || folderPhase !== 'open') return

    const handleOutside = (event: Event) => {
      if (!collageRef.current?.contains(event.target as Node)) {
        closeFolder()
      }
    }

    const timer = window.setTimeout(() => {
      document.addEventListener('touchstart', handleOutside, { passive: true })
      document.addEventListener('click', handleOutside)
    }, 0)

    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('touchstart', handleOutside)
      document.removeEventListener('click', handleOutside)
    }
  }, [closeFolder, folderPhase, tapMode])

  const mobileTapProps =
    tapMode && folderPhase === 'idle'
      ? {
          role: 'button' as const,
          tabIndex: 0,
          onClick: handleAssetTap,
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleAssetTap(event)
            }
          },
        }
      : {}

  const tapTarget = tapMode && folderPhase === 'idle' ? styles.mobileTapTarget : undefined
  const tapClass = (baseClass: string) => (tapTarget ? `${baseClass} ${tapTarget}` : baseClass)

  return (
    <motion.div
      ref={collageRef}
      className={styles.collage}
      variants={assembleItem}
      data-open={folderPhase === 'open' ? '' : undefined}
      data-closing={folderPhase === 'closing' ? '' : undefined}
      data-mobile={isMobile ? '' : undefined}
      data-intro={intro}
      aria-label="Skills collage. Hover folder front to reveal navigation notes"
      onMouseLeave={tapMode ? undefined : closeFolder}
      onBlur={(event) => {
        if (tapMode) return
        if (!collageRef.current?.contains(event.relatedTarget as Node | null)) {
          closeFolder()
        }
      }}
    >
      <AnimatePresence mode="wait">
        {folderPhase === 'idle' ? (
          <motion.div
            key={tapMode ? 'tap-bubble' : 'hover-bubble'}
            className={`${styles.collageBubbleAnchor} ${styles.collageBubbleTap}`}
            aria-hidden="true"
            initial={exploreBubbleMotion.initial}
            animate={exploreBubbleMotion.animate}
            exit={exploreBubbleMotion.exit}
            transition={bubblePopIn}
            style={{ transformOrigin: '50% 100%' }}
          >
            <div className={`${styles.collageBubble} ${styles.collageBubbleVibrate}`}>
              {tapMode ? 'TAP!!' : 'Hover to explore'}
            </div>
          </motion.div>
        ) : null}

        {folderPhase === 'open' ? (
          <motion.div
            key={tapMode ? 'pick-bubble' : 'select-bubble'}
            className={`${styles.collageBubbleAnchor} ${styles.collageBubblePick}`}
            aria-hidden="true"
            initial={selectBubbleMotion.initial}
            animate={selectBubbleMotion.animate}
            exit={selectBubbleMotion.exit}
            transition={{ ...bubblePopIn, delay: 0.05 }}
            style={{ transformOrigin: '50% 100%' }}
          >
            <div className={styles.collageBubble}>
              {tapMode ? 'Pick one!!' : 'Select one'}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* COLLAGE ORCHID — its own file: CollageOrchid.tsx */}
      <CollageOrchid className={tapTarget} {...mobileTapProps} />

      {isMobile ? (
        <img
          src={paperImg}
          alt=""
          className={styles.mobileBackPage}
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          decoding="async"
        />
      ) : null}

      <div className={styles.folder}>
        {/* COLLAGE BLACK PAGE — its own file: CollageBlackPage.tsx */}
        <CollageBlackPage />

        <img
          src={fileBackImg}
          alt=""
          className={styles.fileBack}
          aria-hidden="true"
          draggable={false}
          loading="lazy"
          decoding="async"
        />

        {isMobile ? <div className={styles.fixedPage} aria-hidden="true" /> : null}

        <div className={styles.paperPages} aria-hidden="true">
          <img
            src={pinkPolkaImg}
            alt=""
            className={`${styles.paperPage} ${styles.pagePink}`}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
          <img
            src={whitePolkaImg}
            alt=""
            className={`${styles.paperPage} ${styles.pageWhite}`}
            draggable={false}
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className={styles.skillNotes}>
          {SKILL_LINKS.map(({ id, label, image, className }) => (
            <button
              key={id}
              type="button"
              className={`${styles.noteLink} ${className}`}
              aria-label={label}
              onClick={() => handleNoteSelect(id)}
              onTransitionEnd={handleNoteTransitionEnd}
            >
              <img src={image} alt="" draggable={false} loading="lazy" decoding="async" />
            </button>
          ))}
        </div>

        <img
          src={fileFrontImg}
          alt="Skills folder"
          className={tapClass(styles.fileFront)}
          tabIndex={0}
          draggable={false}
          loading="lazy"
          decoding="async"
          onMouseEnter={tapMode ? undefined : openFolder}
          onFocus={tapMode ? undefined : openFolder}
          {...mobileTapProps}
        />
      </div>

      <img
        src={paperclipImg}
        alt=""
        className={tapClass(styles.paperclip)}
        aria-hidden="true"
        draggable={false}
        loading="lazy"
        decoding="async"
        {...mobileTapProps}
      />

      <img
        src={decoImg}
        alt="Mirvé Blvck illustration and note"
        className={tapClass(styles.deco)}
        draggable={false}
        loading="lazy"
        decoding="async"
        {...mobileTapProps}
      />


    </motion.div>
  )
}

/** The folder collage, centred on its own (the About text has its own section above). */
export function AboutSection({
  onSelectCategory,
  isHomeActive = true,
}: {
  onSelectCategory: (category: ExpertiseCategory) => void
  isHomeActive?: boolean
}) {
  return (
    <section className={`${styles.section} ${styles.collageOnly}`} aria-label="Skills collage">
      <div className={styles.container}>
        <motion.div
          className={styles.skillsCol}
          variants={staggerContainer(0.15)}
          initial="hidden"
          animate="visible"
        >
          <SkillsCollage onSelectCategory={onSelectCategory} isHomeActive={isHomeActive} />
        </motion.div>
      </div>
    </section>
  )
}
