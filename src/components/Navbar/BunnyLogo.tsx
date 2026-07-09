import bunnyPfp from '../../assets/mifty_bunny_pfp.png'
import styles from './Navbar.module.css'

export function BunnyLogo() {
  return (
    <div className={styles.logo}>
      <img
        src={bunnyPfp}
        alt=""
        className={styles.logoImg}
        width={36}
        height={36}
        draggable={false}
      />
    </div>
  )
}
