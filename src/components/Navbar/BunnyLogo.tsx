import { motion, type Variants } from 'framer-motion'
import bunnyPfp from '../../assets/mifty_bunny_pfp.png'
import styles from './Navbar.module.css'

type BunnyLogoProps = {
  variants?: Variants
}

export function BunnyLogo({ variants }: BunnyLogoProps) {
  return (
    <motion.div className={styles.logo} variants={variants}>
      <img
        src={bunnyPfp}
        alt=""
        className={styles.logoImg}
        width={36}
        height={36}
        draggable={false}
      />
    </motion.div>
  )
}
