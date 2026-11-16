import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { buildJournal, type JournalFace } from './journalPages'
import styles from './Journal.module.css'

const TURN_MS = 1000
const PAGE_RATIO = 0.72 // width / height of one page

/** Pages are only painted near the open spread, so ~50 images don't all load at once. */
const NEAR = 3

function useBookSize() {
  const measure = () => {
    const maxH = Math.min(window.innerHeight * 0.74, 720)
    const maxPageW = (window.innerWidth * 0.94) / 2
    const pageW = Math.min(maxH * PAGE_RATIO, maxPageW)
    return { pageW: Math.round(pageW), pageH: Math.round(pageW / PAGE_RATIO) }
  }
  const [size, setSize] = useState(measure)
  useEffect(() => {
    const onResize = () => setSize(measure())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}

function Face({ face, side, pageNo, show }: { face: JournalFace; side: 'front' | 'back'; pageNo: number; show: boolean }) {
  const paper = side === 'front' ? styles.paperRight : styles.paperLeft

  if (face.kind === 'cover') {
    return (
      <div className={`${styles.face} ${styles.cover}`}>
        <span className={styles.coverBand} aria-hidden="true" />
        <div className={styles.coverTitle}>
          <span className={styles.coverKicker}>Sketchbook · Vol. 01</span>
          <span className={styles.coverName}>MIRVÉ</span>
          <span className={styles.coverSub}>art journal</span>
        </div>
        <span className={styles.coverHint}>tap to open →</span>
      </div>
    )
  }

  if (face.kind === 'back') {
    return (
      <div className={`${styles.face} ${styles.cover} ${styles.backCover}`}>
        <span className={styles.coverBand} aria-hidden="true" />
        <span className={styles.backMark}>M.</span>
      </div>
    )
  }

  return (
    <div className={`${styles.face} ${styles.paper} ${paper}`}>
      {face.kind === 'title' ? (
        <div className={styles.titlePage}>
          <span className={styles.titleSmall}>this book belongs to</span>
          <span className={styles.titleName}>Mirvé</span>
          <span className={styles.titleRule} aria-hidden="true" />
          <span className={styles.titleSmall}>portraits, characters, stories &amp; other obsessions</span>
        </div>
      ) : null}

      {face.kind === 'art' ? (
        <figure className={styles.art} style={{ '--tilt': `${((pageNo * 37) % 7) - 3}deg` } as CSSProperties}>
          <span className={styles.tape} aria-hidden="true" />
          {show ? (
            <img src={face.src} alt={`${face.series}, ${face.subtitle.toLowerCase()} — piece ${face.index}`} draggable={false} decoding="async" />
          ) : (
            <span className={styles.artPlaceholder} />
          )}
          <figcaption>
            <span className={styles.captionSeries}>{face.series}</span>
            <span className={styles.captionSub}>
              {face.subtitle} · {String(face.index).padStart(2, '0')}
            </span>
          </figcaption>
        </figure>
      ) : null}

      {face.kind === 'notes' ? <div className={styles.notes} aria-hidden="true" /> : null}

      {face.kind === 'end' ? (
        <div className={styles.titlePage}>
          <span className={styles.titleName}>to be continued</span>
          <span className={styles.titleRule} aria-hidden="true" />
          <a className={styles.endLink} href="/expertise">see the full portfolio →</a>
        </div>
      ) : null}

      <span className={styles.pageNo}>{pageNo}</span>
    </div>
  )
}

/**
 * A 3D art journal. Each leaf is a real page with a front and back that turns on the spine; flip by
 * clicking a page, dragging/swiping, the arrow keys or the buttons. The closed book sits centred on its cover.
 */
export function JournalPage() {
  const faces = useMemo(buildJournal, [])
  const leaves = faces.length / 2
  const [flipped, setFlipped] = useState(0) // how many leaves have turned to the left
  const [turning, setTurning] = useState<number | null>(null)
  const { pageW, pageH } = useBookSize()
  const turnTimer = useRef<number>(0)
  const drag = useRef<{ x: number; id: number } | null>(null)

  const flippedRef = useRef(0)

  const go = useCallback(
    (dir: 1 | -1) => {
      const f = flippedRef.current
      const next = Math.max(0, Math.min(leaves, f + dir))
      if (next === f) return
      flippedRef.current = next
      setFlipped(next)
      // the turning leaf rides above the rest until it lands
      setTurning(dir === 1 ? f : next)
      window.clearTimeout(turnTimer.current)
      turnTimer.current = window.setTimeout(() => setTurning(null), TURN_MS)
    },
    [leaves],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  useEffect(() => () => window.clearTimeout(turnTimer.current), [])

  useEffect(() => {
    document.title = 'Sketchbook — Mirvé'
  }, [])

  // closed: centre the cover; finished: centre the back cover; otherwise centre the spine
  const shift = flipped === 0 ? -pageW / 2 : flipped === leaves ? pageW / 2 : 0

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, id: e.pointerId }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const start = drag.current
    drag.current = null
    if (!start || start.id !== e.pointerId) return
    const dx = e.clientX - start.x
    if (Math.abs(dx) > 40) {
      go(dx < 0 ? 1 : -1)
      return
    }
    // a tap: right half turns forward, left half turns back
    const book = (e.currentTarget as HTMLElement).getBoundingClientRect()
    go(e.clientX > book.left + book.width / 2 ? 1 : -1)
  }

  const spread = flipped === 0 ? 'Cover' : flipped === leaves ? 'Back cover' : `${flipped * 2 - 1}–${flipped * 2}`

  return (
    <main className={styles.stage}>
      <header className={styles.header}>
        <a className={styles.homeLink} href="/">← MIRVÉ</a>
        <span className={styles.headerTitle}>Sketchbook</span>
        <span className={styles.headerCount}>{spread}</span>
      </header>

      <div
        className={styles.scene}
        style={{ '--page-w': `${pageW}px`, '--page-h': `${pageH}px`, '--turn-ms': `${TURN_MS}ms` } as CSSProperties}
      >
        <div
          className={styles.book}
          style={{ transform: `translateX(${shift}px)` }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          role="region"
          aria-label="Art journal. Use the arrow keys or click a page to turn it."
        >
          {Array.from({ length: leaves }, (_, i) => {
            const isFlipped = i < flipped
            const z = turning === i ? leaves + 2 : isFlipped ? i + 1 : leaves - i
            const show = Math.abs(i - flipped) <= NEAR
            return (
              <div
                key={i}
                className={`${styles.leaf}${isFlipped ? ` ${styles.isFlipped}` : ''}${turning === i ? ` ${styles.isTurning}` : ''}`}
                style={{ zIndex: z }}
                aria-hidden={!(i === flipped || i === flipped - 1)}
              >
                <div className={styles.front}>
                  <Face face={faces[i * 2]!} side="front" pageNo={i * 2} show={show} />
                </div>
                <div className={styles.back}>
                  <Face face={faces[i * 2 + 1]!} side="back" pageNo={i * 2 + 1} show={show} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <nav className={styles.controls} aria-label="Turn pages">
        <button type="button" onClick={() => go(-1)} disabled={flipped === 0}>
          ← prev
        </button>
        <span className={styles.progress} aria-hidden="true">
          <i style={{ transform: `scaleX(${flipped / leaves})` }} />
        </span>
        <button type="button" onClick={() => go(1)} disabled={flipped === leaves}>
          next →
        </button>
      </nav>
    </main>
  )
}
