import orchidImg from '../../assets/orchid1.png'
import { NowPlaying } from '../NowPlaying'
import { BunnyLogo } from './BunnyLogo'
import styles from './Navbar.module.css'

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <a href="/" className={styles.brand} aria-label="MIRVÉ — Home">
        <BunnyLogo />
        <div className={styles.brandText}>
          <span className={styles.name}>MIRVÉ</span>
          <span className={styles.tagline}>
            Product Engineer | Illustrator
          </span>
        </div>
      </a>

      <div className={styles.container}>
        <div className={styles.nowPlayingWrap}>
          <NowPlaying />
        </div>
      </div>

      <img
        src={orchidImg}
        alt=""
        className={styles.orchid}
        aria-hidden="true"
        draggable={false}
      />
    </header>
  )
}
