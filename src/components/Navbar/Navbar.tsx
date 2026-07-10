import { motion } from 'framer-motion'
import flowerImg from '../../assets/flower2.png'
import orchidImg from '../../assets/orchid1.png'
import { NowPlaying } from '../NowPlaying'
import styles from './Navbar.module.css'

const brandSpring = { type: 'spring' as const, stiffness: 520, damping: 14 }

const textHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.04,
    y: -2,
    transition: { ...brandSpring, delay: 0.04 },
  },
}

export function Navbar() {
  return (
    <header className={styles.navbar}>
      <motion.a
        href="/"
        className={styles.brand}
        aria-label="MIRVÉ — Home"
        initial="rest"
        whileHover="hover"
      >
        <motion.div className={styles.brandText} variants={textHover}>
          <span className={styles.name}>MIRVÉ</span>
          <span className={styles.tagline}>
            Product Engineer | Illustrator
          </span>
        </motion.div>
      </motion.a>

      <div className={styles.cornerFlowers} aria-hidden="true">
        <img
          src={flowerImg}
          alt=""
          className={styles.cornerFlowerBack}
          draggable={false}
        />
        <img
          src={flowerImg}
          alt=""
          className={styles.cornerFlowerFront}
          draggable={false}
        />
      </div>

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
