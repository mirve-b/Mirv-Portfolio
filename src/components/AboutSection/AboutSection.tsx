import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import artImg from '../../assets/art.png'
import decoImg from '../../assets/deco.png'
import devImg from '../../assets/dev.png'
import fileBackImg from '../../assets/BACK.png'
import fileFrontImg from '../../assets/FRONT.png'
import flowerImg from '../../assets/flower2.png'
import orchidImg from '../../assets/orchid1.png'
import paperclipImg from '../../assets/PaperClip.png'
import uiUxImg from '../../assets/ui_ux.png'
import { useIsMobile } from '../../lib/useIsMobile'
import {
  assembleItem,
  slideFromLeft,
  staggerContainer,
} from '../../lib/motion'
import { SkillsPanel } from './SkillsPanel'
import styles from './AboutSection.module.css'

const SKILL_LINKS = [
  { href: '#art', label: 'Art portfolio', image: artImg, className: styles.noteArt },
  { href: '#ui-ux', label: 'UI and UX work', image: uiUxImg, className: styles.noteUiUx },
  { href: '#development', label: 'Development work', image: devImg, className: styles.noteDev },
] as const

type FolderPhase = 'idle' | 'open' | 'closing'

const bubblePop = { type: 'spring' as const, stiffness: 560, damping: 16 }

function SkillsCollage() {
  const collageRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const [folderPhase, setFolderPhase] = useState<FolderPhase>('idle')

  const openFolder = useCallback(() => {
    setFolderPhase('open')
  }, [])

  const closeFolder = useCallback(() => {
    setFolderPhase((phase) => (phase === 'open' ? 'closing' : phase))
  }, [])

  const handleAssetTap = useCallback(
    (event: React.MouseEvent | React.KeyboardEvent) => {
      if (!isMobile || folderPhase !== 'idle') return
      event.stopPropagation()
      openFolder()
    },
    [folderPhase, isMobile, openFolder],
  )

  const handleNoteTransitionEnd = useCallback(
    (event: React.TransitionEvent<HTMLAnchorElement>) => {
      if (event.propertyName !== 'transform') return
      if (folderPhase !== 'closing') return
      if (!event.currentTarget.classList.contains(styles.noteDev)) return
      setFolderPhase('idle')
    },
    [folderPhase],
  )

  useEffect(() => {
    if (!isMobile || folderPhase !== 'open') return

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
  }, [closeFolder, folderPhase, isMobile])

  const mobileTapProps = isMobile
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

  const tapClass = (baseClass: string) =>
    isMobile ? `${baseClass} ${styles.mobileTapTarget}` : baseClass

  return (
    <motion.div
      ref={collageRef}
      className={styles.collage}
      variants={assembleItem}
      data-open={folderPhase === 'open' ? '' : undefined}
      data-closing={folderPhase === 'closing' ? '' : undefined}
      data-mobile={isMobile ? '' : undefined}
      aria-label="Skills collage — hover folder front to reveal navigation notes"
      onMouseLeave={isMobile ? undefined : closeFolder}
      onBlur={(event) => {
        if (isMobile) return
        if (!collageRef.current?.contains(event.relatedTarget as Node | null)) {
          closeFolder()
        }
      }}
    >
      <AnimatePresence mode="wait">
        {isMobile && folderPhase === 'idle' ? (
          <motion.div
            key="tap-bubble"
            className={`${styles.collageBubbleAnchor} ${styles.collageBubbleTap}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          >
            <motion.div
              className={`${styles.collageBubble} ${styles.collageBubbleVibrate}`}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.45 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.22 }}
              transition={bubblePop}
            >
              TAP!!
            </motion.div>
          </motion.div>
        ) : null}

        {isMobile && folderPhase === 'open' ? (
          <motion.div
            key="pick-bubble"
            className={`${styles.collageBubbleAnchor} ${styles.collageBubblePick}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          >
            <motion.div
              className={styles.collageBubble}
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.45, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: -6 }}
              transition={bubblePop}
            >
              Pick one!!
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <img
        src={orchidImg}
        alt=""
        className={tapClass(styles.orchidTopRight)}
        aria-hidden="true"
        draggable={false}
        {...mobileTapProps}
      />

      <div className={styles.folder}>
        <img
          src={fileBackImg}
          alt=""
          className={styles.fileBack}
          aria-hidden="true"
          draggable={false}
        />

        <div className={styles.skillNotes}>
          {SKILL_LINKS.map(({ href, label, image, className }) => (
            <a
              key={href}
              href={href}
              className={`${styles.noteLink} ${className}`}
              aria-label={label}
              onTransitionEnd={handleNoteTransitionEnd}
            >
              <img src={image} alt="" draggable={false} />
            </a>
          ))}
        </div>

        <img
          src={fileFrontImg}
          alt="Skills folder"
          className={tapClass(styles.fileFront)}
          tabIndex={0}
          draggable={false}
          onMouseEnter={isMobile ? undefined : openFolder}
          onFocus={isMobile ? undefined : openFolder}
          {...mobileTapProps}
        />
      </div>

      <img
        src={paperclipImg}
        alt=""
        className={tapClass(styles.paperclip)}
        aria-hidden="true"
        draggable={false}
        {...mobileTapProps}
      />

      <img
        src={decoImg}
        alt="Mirvé Blvck illustration and note"
        className={tapClass(styles.deco)}
        draggable={false}
        {...mobileTapProps}
      />

      <img
        src={flowerImg}
        alt=""
        className={tapClass(styles.flowerLeft)}
        aria-hidden="true"
        draggable={false}
        {...mobileTapProps}
      />

      <img
        src={flowerImg}
        alt=""
        className={tapClass(styles.flowerBottomRight)}
        aria-hidden="true"
        draggable={false}
        {...mobileTapProps}
      />
    </motion.div>
  )
}

export function AboutSection() {
  return (
    <section className={styles.section} aria-labelledby="about-heading">
      <img
        src={flowerImg}
        alt=""
        className={styles.flowerFarLeft}
        aria-hidden="true"
        draggable={false}
      />

      <img
        src={orchidImg}
        alt=""
        className={styles.orchidFarLeft}
        aria-hidden="true"
        draggable={false}
      />

      <div className={styles.container}>
        <motion.div
          className={styles.aboutCol}
          variants={slideFromLeft}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.aboutContent}>
            <h2 id="about-heading" className={styles.heading}>
              About Me
            </h2>
            <p className={styles.subheading}>
              Equal parts pixels, logic, and sketchbooks
            </p>
            <p className={styles.body}>
              Product Engineer with a background in illustration — I build
              user-centered digital products through Flutter, UI/UX, and
              scalable frontend architecture, from concept to shipped experience.
            </p>
            <SkillsPanel />
          </div>
        </motion.div>

        <motion.div
          className={styles.skillsCol}
          variants={staggerContainer(0.15)}
          initial="hidden"
          animate="visible"
        >
          <SkillsCollage />
        </motion.div>
      </div>
    </section>
  )
}
