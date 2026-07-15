import { useEffect, useState } from 'react'
import styles from './NowPlaying.module.css'

const BAR_COUNT = 5

type WaveformProps = {
  active: boolean
}

export function Waveform({ active }: WaveformProps) {
  const [showMotion, setShowMotion] = useState(false)

  useEffect(() => {
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const sync = () => {
      setShowMotion(!coarsePointer.matches && !reducedMotion.matches)
    }

    sync()
    coarsePointer.addEventListener('change', sync)
    reducedMotion.addEventListener('change', sync)

    return () => {
      coarsePointer.removeEventListener('change', sync)
      reducedMotion.removeEventListener('change', sync)
    }
  }, [])

  if (!active || !showMotion) return null

  return (
    <div className={styles.waveform} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span key={index} className={styles.waveBar} />
      ))}
    </div>
  )
}
