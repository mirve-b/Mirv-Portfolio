import { useEffect, useRef } from 'react'
import styles from './NowPlaying.module.css'

const BAR_COUNT = 5

type WaveformProps = {
  analyser: AnalyserNode | null
  isPlaying: boolean
}

export function Waveform({ analyser, isPlaying }: WaveformProps) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    if (!isPlaying || !analyser) return

    const data = new Uint8Array(analyser.frequencyBinCount)

    const tick = () => {
      analyser.getByteFrequencyData(data)

      barsRef.current.forEach((bar, index) => {
        if (!bar) return
        const sample = Math.floor((index / BAR_COUNT) * data.length * 0.45)
        const level = data[sample] / 255
        bar.style.height = `${Math.max(2, level * 10 + 2)}px`
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    tick()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, isPlaying])

  if (!isPlaying) return null

  return (
    <div className={styles.waveform} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span
          key={index}
          ref={(element) => {
            barsRef.current[index] = element
          }}
          className={styles.waveBar}
        />
      ))}
    </div>
  )
}
