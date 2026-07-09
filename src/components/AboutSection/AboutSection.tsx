import { useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import artImg from '../../assets/art.png'
import decoImg from '../../assets/deco.png'
import devImg from '../../assets/dev.png'
import fileBackImg from '../../assets/BACK.png'
import fileFrontImg from '../../assets/FRONT.png'
import flowerImg from '../../assets/flower2.png'
import orchidImg from '../../assets/orchid1.png'
import paperclipImg from '../../assets/PaperClip.png'
import uiUxImg from '../../assets/ui_ux.png'
import {
  assembleItem,
  slideFromLeft,
  staggerContainer,
} from '../../lib/motion'
import styles from './AboutSection.module.css'

const SKILL_LINKS = [
  { href: '#art', label: 'Art portfolio', image: artImg, className: styles.noteArt },
  { href: '#ui-ux', label: 'UI and UX work', image: uiUxImg, className: styles.noteUiUx },
  { href: '#development', label: 'Development work', image: devImg, className: styles.noteDev },
] as const

type FolderPhase = 'idle' | 'open' | 'closing'

function SkillsCollage() {
  const [folderPhase, setFolderPhase] = useState<FolderPhase>('idle')

  const openFolder = useCallback(() => {
    setFolderPhase('open')
  }, [])

  const closeFolder = useCallback(() => {
    setFolderPhase((phase) => (phase === 'open' ? 'closing' : phase))
  }, [])

  const handleNoteAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLAnchorElement>) => {
      if (folderPhase !== 'closing') return
      if (!event.currentTarget.classList.contains(styles.noteDev)) return
      setFolderPhase('idle')
    },
    [folderPhase],
  )

  return (
    <motion.div
      className={styles.collage}
      variants={assembleItem}
      tabIndex={0}
      data-open={folderPhase === 'open' ? '' : undefined}
      data-closing={folderPhase === 'closing' ? '' : undefined}
      aria-label="Skills collage — hover to reveal navigation notes"
      onMouseEnter={openFolder}
      onMouseLeave={closeFolder}
      onFocus={openFolder}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          closeFolder()
        }
      }}
    >
      <img
        src={orchidImg}
        alt=""
        className={styles.orchidTopRight}
        aria-hidden="true"
        draggable={false}
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
              onAnimationEnd={handleNoteAnimationEnd}
            >
              <img src={image} alt="" draggable={false} />
            </a>
          ))}
        </div>

        <img
          src={fileFrontImg}
          alt="Skills folder"
          className={styles.fileFront}
          draggable={false}
        />
      </div>

      <img
        src={paperclipImg}
        alt=""
        className={styles.paperclip}
        aria-hidden="true"
        draggable={false}
      />

      <img
        src={decoImg}
        alt="Mirvé Blvck illustration and note"
        className={styles.deco}
        draggable={false}
      />

      <img
        src={flowerImg}
        alt=""
        className={styles.flowerLeft}
        aria-hidden="true"
        draggable={false}
      />

      <img
        src={flowerImg}
        alt=""
        className={styles.flowerBottomRight}
        aria-hidden="true"
        draggable={false}
      />
    </motion.div>
  )
}

export function AboutSection() {
  return (
    <section className={styles.section} aria-labelledby="about-heading">
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
              I build digital products from concept to implementation,
              combining product thinking, UI/UX, and software engineering with
              a foundation in illustration.
            </p>
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
