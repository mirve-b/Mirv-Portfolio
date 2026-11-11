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

const HEART_PATH =
  'M12 21.2C11.6 21.2 11.2 21 10.9 20.8C6.6 17.5 2 13.7 2 8.9C2 5.9 4.3 3.5 7.2 3.5C9.1 3.5 10.9 4.5 12 6.1C13.1 4.5 14.9 3.5 16.8 3.5C19.7 3.5 22 5.9 22 8.9C22 13.7 17.4 17.5 13.1 20.8C12.8 21 12.4 21.2 12 21.2Z'

/** Minimal white heart with a thin black outline — reads on dark and light. */
function HeartCursor() {
  return (
    <svg className={styles.cursorBody} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={HEART_PATH}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

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
      cursor.removeAttribute('data-away')
    }

    const onMove = (event: MouseEvent) => {
      moveCursor(event.clientX, event.clientY)
    }

    // Cross-origin iframes (the Spotify player) swallow mouse events, so the
    // dot would freeze at the edge. Hide it there and let the native cursor show.
    const onOver = (event: MouseEvent) => {
      if (event.target instanceof HTMLIFrameElement) {
        cursorRef.current?.setAttribute('data-away', '')
      }
    }

    const onDown = (event: MouseEvent) => {
      moveCursor(event.clientX, event.clientY)
      cursorRef.current?.setAttribute('data-pressed', '')
      window.requestAnimationFrame(() => {
        spawnClickSpark(event.clientX, event.clientY)
      })
    }

    const onUp = () => {
      cursorRef.current?.removeAttribute('data-pressed')
    }

    const onLeaveWindow = () => {
      cursorRef.current?.setAttribute('data-away', '')
    }

    const onEnterWindow = () => {
      cursorRef.current?.removeAttribute('data-away')
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    document.documentElement.addEventListener('mouseleave', onLeaveWindow)
    document.documentElement.addEventListener('mouseenter', onEnterWindow)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow)
      document.documentElement.removeEventListener('mouseenter', onEnterWindow)
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
      <div ref={cursorRef} className={styles.cursor}>
        <HeartCursor />
      </div>
    </div>
  )
}
