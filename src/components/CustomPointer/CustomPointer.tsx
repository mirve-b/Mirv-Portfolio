import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './CustomPointer.module.css'

type ClickSparkParticle = {
  id: number
  x: number
  y: number
  size: number
  dx: number
  dy: number
  kind: 'star' | 'dot'
  duration: number
}

const CLICK_SPARK_BURSTS = [
  { kind: 'star' as const, size: 11, angle: 12, distance: 48, duration: 640 },
  { kind: 'star' as const, size: 16, angle: 118, distance: 72, duration: 760 },
  { kind: 'star' as const, size: 9, angle: 232, distance: 38, duration: 580 },
  { kind: 'dot' as const, size: 1.5, angle: 58, distance: 34, duration: 520 },
  { kind: 'dot' as const, size: 1.25, angle: 178, distance: 56, duration: 680 },
  { kind: 'dot' as const, size: 1.75, angle: 298, distance: 78, duration: 820 },
] as const

const HTML_ACTIVE_CLASS = 'custom-pointer-active'

let particleId = 0

export function CustomPointer() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [particles, setParticles] = useState<ClickSparkParticle[]>([])

  const removeParticle = useCallback((id: number) => {
    setParticles((current) => current.filter((particle) => particle.id !== id))
  }, [])

  const spawnClickSpark = useCallback((x: number, y: number) => {
    const burst = CLICK_SPARK_BURSTS.map((config) => {
      const radians = (config.angle * Math.PI) / 180
      return {
        id: ++particleId,
        x,
        y,
        size: config.size,
        kind: config.kind,
        duration: config.duration,
        dx: Math.cos(radians) * config.distance,
        dy: Math.sin(radians) * config.distance,
      }
    })

    setParticles((current) => {
      const next = [...current, ...burst]
      return next.length > 24 ? next.slice(-24) : next
    })
  }, [])

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      setEnabled(finePointer.matches && !reducedMotion.matches)
    }

    sync()
    finePointer.addEventListener('change', sync)
    reducedMotion.addEventListener('change', sync)

    return () => {
      finePointer.removeEventListener('change', sync)
      reducedMotion.removeEventListener('change', sync)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    document.documentElement.classList.add(HTML_ACTIVE_CLASS)

    const moveCursor = (x: number, y: number) => {
      const cursor = cursorRef.current
      if (!cursor) return
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
    }

    const onMove = (event: MouseEvent) => {
      moveCursor(event.clientX, event.clientY)
    }

    const onDown = (event: MouseEvent) => {
      moveCursor(event.clientX, event.clientY)
      window.requestAnimationFrame(() => {
        spawnClickSpark(event.clientX, event.clientY)
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mousedown', onDown)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mousedown', onDown)
      document.documentElement.classList.remove(HTML_ACTIVE_CLASS)
    }
  }, [enabled, spawnClickSpark])

  if (!enabled) return null

  return (
    <div className={styles.layer} aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className={particle.kind === 'star' ? styles.star : styles.dot}
          style={
            {
              '--x': `${particle.x}px`,
              '--y': `${particle.y}px`,
              '--dx': `${particle.dx}px`,
              '--dy': `${particle.dy}px`,
              '--size': `${particle.size}px`,
              '--duration': `${particle.duration}ms`,
            } as React.CSSProperties
          }
          onAnimationEnd={() => removeParticle(particle.id)}
        />
      ))}
      <div ref={cursorRef} className={styles.cursor} />
    </div>
  )
}
