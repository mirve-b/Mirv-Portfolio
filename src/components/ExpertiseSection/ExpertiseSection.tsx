import { useEffect, useRef, useState, type ReactNode } from 'react'
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion'
import { loadProjectAssets } from '../../data/projectAssets'
import { useCategoryThumbnails } from './thumbnails'
import { getDevSuiteMedia } from '../../data/devSuites'
import {
  getArtSuiteProjects,
  getCategoryGridProjects,
  getDevTabProjects,
  type PortfolioProjectMeta,
} from '../../data/portfolioProjects'
import { startMutedPreview } from '../../lib/mediaUtils'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { useLiteMedia } from '../../lib/useLiteMedia'
import type { ExpertiseCategory } from '../../lib/pageNavigation'
import { DevSuitePreviewVideo } from '../DevSuiteView/DevSuitePreviewVideo'
import { MediaLoader } from './ShowcaseVideoCard'
import styles from './WorkPages.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

type ExpertiseSectionProps = {
  category: ExpertiseCategory
  onOpenProject: (projectId: string) => void
  hideCards?: boolean
}

const PAGE_TITLES: Record<ExpertiseCategory, { bold: string; light: string; label: string }> = {
  art: { bold: 'ART', light: 'WORK', label: 'Collections' },
  development: { bold: 'DEVELOP', light: 'MENT', label: 'Products & builds' },
  'ui-ux': { bold: 'DESIGN', light: 'UI/UX', label: 'Interfaces' },
}

function LoopVideo({ src, className }: { src: string; className: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const video = ref.current
    if (!video) return
    const observer = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? void startMutedPreview(video) : video.pause()),
      { threshold: 0.15 },
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [src])
  return <video ref={ref} src={src} className={className} loop muted playsInline preload="none" draggable={false} />
}

/** "Explore" with an arrow in a thin circle that fills on hover. A link when it leaves the site. */
function ExploreButton({ label = 'Explore', href, onClick }: { label?: string; href?: string; onClick?: () => void }) {
  const inner = (
    <>
      <span>{label}</span>
      <span className={styles.exploreArrow} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.4">
          {href ? <path d="M7 17L17 7M9 7h8v8" /> : <path d="M5 12h14M13 6l6 6-6 6" />}
        </svg>
      </span>
    </>
  )
  return href ? (
    <a className={styles.explore} href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <button type="button" className={styles.explore} onClick={onClick}>
      {inner}
    </button>
  )
}

/** The page's opening: a big two-weight title and a quiet label with the count. */
function PageHeader({ category, count }: { category: ExpertiseCategory; count: number }) {
  const { bold, light, label } = PAGE_TITLES[category]
  return (
    <header className={styles.header}>
      <motion.h1
        className={styles.title}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        <span className={styles.bold}>{bold}</span>
        <span className={styles.light}>{light}</span>
      </motion.h1>
      <motion.p
        className={styles.headerMeta}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
      >
        <span>{label}</span>
        <span>{String(count).padStart(2, '0')}</span>
      </motion.p>
    </header>
  )
}

/* ---------------- Art: grid sheets ---------------- */

const isVideoSrc = (src: string) => /\.(mp4|mov|webm)(\?|$)/i.test(src)

/** A few pieces from a collection (a suite borrows from its children), for the sheet's side cells. */
function useCollectionPieces(project: PortfolioProjectMeta) {
  const [pieces, setPieces] = useState<string[]>([])
  useEffect(() => {
    let cancelled = false
    const ids = project.detailType === 'art-suite' ? getArtSuiteProjects(project.id).map((p) => p.id) : [project.id]
    Promise.all(ids.map((id) => loadProjectAssets(id).then((a) => a.gallery).catch(() => [] as string[])))
      .then((lists) => {
        if (!cancelled) setPieces(lists.flat())
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [project])
  return pieces
}

/** Picture or film, filling its cell. */
function Media({ src, className, position }: { src?: string; className: string; position?: string }) {
  if (!src) return null
  if (isVideoSrc(src)) return <LoopVideo src={src} className={className} />
  return (
    <img
      src={src}
      alt=""
      className={className}
      style={position ? { objectPosition: position } : undefined}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  )
}

/** A decorative barcode, drawn from the collection's name so each one is its own. */
function Barcode({ seed }: { seed: string }) {
  const bars: { x: number; w: number }[] = []
  let x = 0
  for (let i = 0; x < 120; i++) {
    const c = seed.charCodeAt(i % seed.length) + i * 7
    const w = (c % 3) + 1
    if (i % 2 === 0) bars.push({ x, w })
    x += w + ((c >> 2) % 2) + 1
  }
  return (
    <svg className={styles.barcode} viewBox="0 0 120 34" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={0} width={b.w} height={34} />
      ))}
    </svg>
  )
}

/** A hairline across the sheet. It arrives with the rest of its card (no separate draw-in), so a
 *  card never shows its lines before its picture. */
function Rule({ className }: { className: string }) {
  return <span className={className} aria-hidden="true" />
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * One collection as a spec sheet on a hairline grid: a header strip, the name set huge across
 * the full width, then cells for the details, the cover, and two pieces from inside. Everything
 * rides the page scroll: the name slides sideways, the pictures drift at their own speeds, and
 * the timecode runs while the sheet passes.
 */
function ArtSheet({
  project,
  thumbnail,
  index,
  total,
  onOpen,
}: {
  project: PortfolioProjectMeta
  thumbnail?: string
  index: number
  total: number
  onOpen: () => void
}) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  // phones and tablets: the sheet is still (iPhones can't keep scroll-linked motion in step with
  // the finger, so it would tremble). The name, pictures and timecode rest in place.
  const still = useLiteMedia() || reduced
  const pieces = useCollectionPieces(project)
  const { scrollYProgress } = useScroll(still ? undefined : { target: ref, offset: ['start end', 'end start'] })
  const spring = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.35 })
  // still: everything reads a fixed value, so nothing (the timecode included) updates while scrolling
  const idle = useMotionValue(0)
  const p = still ? idle : spring
  const r = <T,>(from: T, to: T): [T, T] => (still ? [from, from] : [from, to])

  const flip = index % 2 === 1
  const nameX = useTransform(p, [0, 1], flip ? r('-14%', '4%') : r('4%', '-14%'))
  const coverY = useTransform(p, [0, 1], r('-9%', '9%'))
  const pieceAY = useTransform(p, [0, 1], r('14%', '-14%'))
  const pieceBY = useTransform(p, [0, 1], r('-6%', '12%'))
  const timecode = useTransform(p, (v) => {
    const t = Math.round(v * 5400) + index * 731
    return `${pad(Math.floor(t / 3600) % 24)}:${pad(Math.floor(t / 60) % 60)}:${pad(t % 60)}`
  })

  const n = pad(index + 1)
  const name = project.title.toUpperCase()
  const code = `MRV-${name.replace(/[^A-Z]/g, '').slice(0, 3)}-${n}`
  const a = pieces[0] ?? thumbnail
  const b = pieces[1] ?? pieces[0] ?? thumbnail

  return (
    <section ref={ref} className={styles.sheet} data-flip={flip ? '' : undefined} aria-labelledby={`art-${project.id}`}>
      <Rule className={styles.sheetRule} />

      <header className={styles.sheetHead}>
        <span className={styles.cross} aria-hidden="true" />
        <span>Art / Collection {n}</span>
        <span className={styles.sheetHeadMid}>MIRVÉ — Art department</span>
        <span>{code}</span>
        <span className={styles.cross} aria-hidden="true" />
      </header>

      <div className={styles.sheetNameRow}>
        <motion.h2 id={`art-${project.id}`} className={styles.sheetName} style={{ x: nameX }}>
          {name}
          <sup>({n})</sup>
        </motion.h2>
      </div>

      <div className={styles.sheetGrid}>
        <div className={`${styles.cell} ${styles.cellMeta}`}>
          <p className={styles.metaBig}>{n}</p>
          <div className={styles.metaBlock}>
            <p className={styles.metaTitle}>{project.title}</p>
            <p className={styles.metaSub}>{project.subtitle}</p>
          </div>
          <div className={styles.metaSpec}>
            <span>Index</span>
            <span>
              {n} / {pad(total)}
            </span>
            <span>Code</span>
            <span>{code}</span>
          </div>
          <Barcode seed={name} />
          <ExploreButton onClick={onOpen} />
        </div>

        <button type="button" className={`${styles.cell} ${styles.cellCover}`} onClick={onOpen} aria-label={`Open ${project.title}`}>
          <span className={styles.corner} data-pos="tl" aria-hidden="true" />
          <span className={styles.corner} data-pos="tr" aria-hidden="true" />
          <span className={styles.corner} data-pos="bl" aria-hidden="true" />
          <span className={styles.corner} data-pos="br" aria-hidden="true" />
          <motion.div className={styles.parallax} style={{ y: coverY }}>
            {thumbnail ? (
              <Media src={thumbnail} className={styles.fill} position={project.thumbnailPosition} />
            ) : (
              <MediaLoader />
            )}
          </motion.div>
        </button>

        <div className={`${styles.cell} ${styles.cellPieceA}`}>
          <motion.span className={styles.timecode} aria-hidden="true">
            {timecode}
          </motion.span>
          <div className={styles.pieceFrame}>
            <motion.div className={styles.parallax} style={{ y: pieceAY }}>
              <Media src={a} className={styles.fill} />
            </motion.div>
          </div>
        </div>

        <div className={`${styles.cell} ${styles.cellPieceB}`}>
          <div className={styles.pieceFrame}>
            <motion.div className={styles.parallax} style={{ y: pieceBY }}>
              <Media src={b} className={styles.fill} />
            </motion.div>
          </div>
        </div>

        <div className={`${styles.cell} ${styles.cellNote}`}>
          <span className={styles.cross} aria-hidden="true" />
          <p>
            {project.subtitle}
            <br />
            <span>Mirvé · {new Date().getFullYear()}</span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ---------------- Development & Design: simple grid sheets ---------------- */

/**
 * One project as a quieter cousin of the Art sheets: a hairline that draws across, a small spec
 * strip, then two cells on the grid: the preview (with corner brackets) and the details.
 * Every other project mirrors, so the page has a rhythm.
 */
function WorkRow({
  project,
  media,
  index,
  section,
  onOpen,
}: {
  project: PortfolioProjectMeta
  media: ReactNode
  index: number
  /** "Development" or "Design", for the spec strip */
  section: string
  onOpen: () => void
}) {
  const reduced = useReducedMotion()
  const n = pad(index + 1)
  const code = `MRV-${section.slice(0, 3).toUpperCase()}-${n}`
  const flip = index % 2 === 1

  return (
    <motion.article
      className={styles.entry}
      data-flip={flip ? '' : undefined}
      aria-labelledby={`work-${project.id}`}
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 1, ease: EASE }}
    >
      <Rule className={styles.sheetRule} />

      <header className={styles.sheetHead}>
        <span className={styles.cross} aria-hidden="true" />
        <span>
          {section} / Project {n}
        </span>
        <span className={styles.sheetHeadMid}>{project.subtitle}</span>
        <span>{code}</span>
        <span className={styles.cross} aria-hidden="true" />
      </header>

      <div className={styles.entryGrid}>
        <div className={`${styles.cell} ${styles.entryMedia}`}>
          <span className={styles.corner} data-pos="tl" aria-hidden="true" />
          <span className={styles.corner} data-pos="tr" aria-hidden="true" />
          <span className={styles.corner} data-pos="bl" aria-hidden="true" />
          <span className={styles.corner} data-pos="br" aria-hidden="true" />
          {/* the picture is part of the card's own fade-in (no separate wipe), so the card and its
              picture appear together as one piece */}
          <div className={styles.entryMediaInner}>{media}</div>
        </div>

        <div className={`${styles.cell} ${styles.entryInfo}`}>
          <p className={styles.metaBig}>{n}</p>
          <div>
            <h2 id={`work-${project.id}`} className={styles.rowTitle}>
              {project.title}
            </h2>
            {project.titleMark ? <p className={styles.rowMark}>{project.titleMark}</p> : null}
            <p className={styles.rowSubtitle}>{project.subtitle}</p>
            {project.description ? <p className={styles.rowDescription}>{project.description}</p> : null}
            {project.techStack?.length ? (
              <ul className={styles.rowStack} aria-label="Tech stack">
                {project.techStack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </div>
          <ExploreButton
            label={project.externalUrl ? (project.ctaLabel ?? 'Visit') : 'Explore'}
            href={project.externalUrl}
            onClick={project.externalUrl ? undefined : onOpen}
          />
        </div>
      </div>
    </motion.article>
  )
}

function DevMedia({ project }: { project: PortfolioProjectMeta }) {
  const media = getDevSuiteMedia(project.id)
  if (media?.previewVideoSrc) return <DevSuitePreviewVideo src={media.previewVideoSrc} fillCard previewOnly={media.previewOnly} />
  if (media?.previewImageSrc) return <img src={media.previewImageSrc} alt="" className={styles.rowImage} draggable={false} />
  return <MediaLoader />
}

export function ExpertiseSection({ category, onOpenProject, hideCards = false }: ExpertiseSectionProps) {
  const isDev = category === 'development'
  const projects = isDev ? getDevTabProjects() : getCategoryGridProjects(category)
  const { thumbnails, loading } = useCategoryThumbnails(category)

  return (
    <section className={styles.page} aria-label={`${PAGE_TITLES[category].bold} portfolio`}>
      <PageHeader category={category} count={projects.length} />

      {hideCards ? null : category === 'art' ? (
        <div className={styles.sheets}>
          {projects.map((project, index) => (
            <ArtSheet
              key={project.id}
              project={project}
              thumbnail={thumbnails[project.id]}
              index={index}
              total={projects.length}
              onOpen={() => onOpenProject(project.id)}
            />
          ))}
        </div>
      ) : (
        <div className={styles.rows}>
          {projects.map((project, index) => (
            <WorkRow
              key={project.id}
              project={project}
              index={index}
              section={isDev ? 'Development' : 'Design'}
              onOpen={() => onOpenProject(project.id)}
              media={
                isDev ? (
                  <DevMedia project={project} />
                ) : thumbnails[project.id] ? (
                  <img
                    src={thumbnails[project.id]}
                    alt=""
                    className={styles.rowImage}
                    style={project.thumbnailPosition ? { objectPosition: project.thumbnailPosition } : undefined}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                ) : loading ? (
                  <MediaLoader />
                ) : null
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}
