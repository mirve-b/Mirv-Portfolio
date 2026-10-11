import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from '../../lib/useIsMobile'
import styles from './ToyBoxBackground.module.css'

type StarKind = 'four' | 'five'

type StarSpec = {
  id: number
  x: number
  y: number
  size: number
  rot: number
  kind: StarKind
  color: string
}

type DotSpec = {
  id: number
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const MUTED_PASTELS = [
  '#e7b7c6',
  '#b7c9ea',
  '#ead9a8',
  '#d3bcea',
  '#e8a8c4',
  '#c9b4e4',
  '#f0c9b0',
  '#b8d4d8',
]

const GLITCH_COLORS = [
  '#ffc1d6',
  '#c5dcff',
  '#ffe9a3',
  '#e0c4ff',
  '#ff7eb6',
]

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function inCardKeepout(x: number, y: number, mobile: boolean) {
  if (mobile) return x > 24 && x < 76 && y > 30 && y < 90
  return x > 31 && x < 69 && y > 26 && y < 74
}

function placePoints(
  count: number,
  seed: number,
  minDist: number,
  avoidCards = false,
  mobile = false,
): Array<{ x: number; y: number }> {
  const rand = mulberry32(seed)
  const points: Array<{ x: number; y: number }> = []
  let attempts = 0

  while (points.length < count && attempts < count * 90) {
    attempts += 1
    const edge = rand()
    const x =
      edge < 0.22
        ? rand() * 16
        : edge < 0.44
          ? 84 + rand() * 16
          : 8 + rand() * 84
    const y =
      edge < 0.18
        ? rand() * 18
        : edge < 0.36
          ? 82 + rand() * 18
          : 6 + rand() * 88

    if (avoidCards && inCardKeepout(x, y, mobile)) continue

    const tooClose = points.some((point) => {
      const dx = point.x - x
      const dy = (point.y - y) * 0.62
      return dx * dx + dy * dy < minDist * minDist
    })
    if (tooClose) continue
    points.push({ x, y })
  }

  return points
}

function buildStars(count: number, seed: number, mobile = false): StarSpec[] {
  const rand = mulberry32(seed + 11)
  const sizes = [12, 14, 16, 18, 22, 26, 32, 40, 52, 64]
  return placePoints(count, seed, 7.5, true, mobile).map((point, index) => ({
    id: index,
    x: point.x,
    y: point.y,
    size: sizes[Math.floor(rand() * sizes.length)] ?? 22,
    rot: Math.floor(rand() * 360),
    kind: rand() > 0.45 ? 'four' : 'five',
    color: MUTED_PASTELS[Math.floor(rand() * MUTED_PASTELS.length)] ?? MUTED_PASTELS[0],
  }))
}

function buildDots(count: number, seed: number): DotSpec[] {
  const rand = mulberry32(seed + 29)
  const sizes = [1.5, 1.75, 2]
  return placePoints(count, seed, 5.2).map((point, index) => ({
    id: index,
    x: point.x,
    y: point.y,
    size: sizes[Math.floor(rand() * sizes.length)] ?? 3,
    delay: rand() * 4,
    duration: 3.4 + rand() * 4.2,
  }))
}

const DESKTOP_STARS = buildStars(26, 42)
const MOBILE_STARS = buildStars(16, 87, true)
const DESKTOP_DOTS = buildDots(34, 63)
const MOBILE_DOTS = buildDots(20, 19)

function pickGlitchColor(exclude?: string) {
  const pool = GLITCH_COLORS.filter((color) => color !== exclude)
  return pool[Math.floor(Math.random() * pool.length)] ?? GLITCH_COLORS[0]
}

export function ToyBoxBackground() {
  const isMobile = useIsMobile()
  const stars = isMobile ? MOBILE_STARS : DESKTOP_STARS
  const dots = isMobile ? MOBILE_DOTS : DESKTOP_DOTS
  const [glitches, setGlitches] = useState<Record<number, string>>({})
  const glitchesRef = useRef(glitches)
  const lastIdRef = useRef<number | null>(null)

  useEffect(() => {
    glitchesRef.current = glitches
  }, [glitches])

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (motion.matches) return

    let cancelled = false
    const timers = new Set<number>()

    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id)
        fn()
      }, ms)
      timers.add(id)
    }

    const run = () => {
      if (cancelled) return

      const busy = glitchesRef.current
      const idle = stars
        .map((star) => star.id)
        .filter((id) => busy[id] === undefined && id !== lastIdRef.current)

      const pool = idle.length > 0 ? idle : stars.map((star) => star.id)
      const burst = Math.random() < 0.18 && pool.length > 1 ? 2 : 1
      const chosen: number[] = []

      for (let i = 0; i < burst; i += 1) {
        const remaining = pool.filter((id) => !chosen.includes(id))
        if (remaining.length === 0) break
        const id = remaining[Math.floor(Math.random() * remaining.length)]
        if (id === undefined) break
        chosen.push(id)
      }

      lastIdRef.current = chosen[0] ?? null

      setGlitches((current) => {
        const next = { ...current }
        for (const id of chosen) {
          next[id] = pickGlitchColor(current[id])
        }
        return next
      })

      later(() => {
        if (cancelled) return
        setGlitches((current) => {
          const next = { ...current }
          for (const id of chosen) {
            delete next[id]
          }
          return next
        })
      }, 160 + Math.random() * 280)

      later(run, 420 + Math.random() * 1400)
    }

    later(run, 700 + Math.random() * 600)

    return () => {
      cancelled = true
      for (const id of timers) window.clearTimeout(id)
      timers.clear()
    }
  }, [stars])

  return (
    <div className={styles.field} aria-hidden="true">
      {dots.map((dot) => (
        <span
          key={`dot-${dot.id}`}
          className={styles.dot}
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            animationDelay: `${dot.delay}s`,
            animationDuration: `${dot.duration}s`,
          }}
        />
      ))}
      {stars.map((star) => {
        const glitchColor = glitches[star.id]
        const glitching = Boolean(glitchColor)

        return (
          <span
            key={`star-${star.id}`}
            className={styles.starWrap}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
            }}
          >
            <span
              className={`${styles.star} ${star.kind === 'four' ? styles.starFour : styles.starFive} ${
                glitching ? styles.starGlitch : ''
              }`}
              style={{
                width: `${star.size}px`,
                color: glitchColor ?? star.color,
                ['--rot' as string]: `${star.rot}deg`,
              }}
            />
          </span>
        )
      })}
    </div>
  )
}
