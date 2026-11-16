import blackPageImg from '../../assets/Collage/black-page.webp'
import styles from './CollageBlackPage.module.css'

/**
 * COLLAGE BLACK PAGE: the black sheet laid behind the folder, running off to the right.
 * Position, size and its intro animation all live in CollageBlackPage.module.css.
 */
export function CollageBlackPage() {
  return (
    <img
      src={blackPageImg}
      alt=""
      className={styles.page}
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  )
}
