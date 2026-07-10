import styles from './NowPlaying.module.css'

const BAR_COUNT = 5

type WaveformProps = {
  active: boolean
}

export function Waveform({ active }: WaveformProps) {
  if (!active) return null

  return (
    <div className={styles.waveform} aria-hidden="true">
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <span key={index} className={styles.waveBar} />
      ))}
    </div>
  )
}
