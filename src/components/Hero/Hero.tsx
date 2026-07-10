import heroVideo from '../../assets/hero.mov'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Portfolio hero">
      <div className={styles.imageWrap}>
        <video
          src={heroVideo}
          className={styles.image}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          draggable={false}
        />

        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.titles}>
            <h1 className={styles.titleAccent}>MIRVÉ</h1>
            <p className={styles.titleLight}>2026 PORTFOLIO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
