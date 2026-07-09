import heroImg from '../../assets/HERO.png'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section className={styles.hero} aria-label="Portfolio hero">
      <div className={styles.imageWrap}>
        <img
          src={heroImg}
          alt="MIRVÉ portfolio illustration"
          className={styles.image}
          draggable={false}
        />

        <div className={styles.overlay} aria-hidden="true">
          <div className={styles.titles}>
            <h1 className={styles.titleAccent}>MIRVÉ</h1>
            <p className={styles.titleLight}>PORTFOLIO</p>
          </div>
        </div>
      </div>
    </section>
  )
}
