import type { ComponentPropsWithoutRef } from 'react'
import orchidImg from '../../assets/Collage/orchid1.webp'
import styles from './CollageOrchid.module.css'

/**
 * COLLAGE ORCHID: the orchid branch standing at the collage's left, behind the note card.
 * Position, size, tilt and its intro animation all live in CollageOrchid.module.css.
 * Extra props (the collage's tap-to-open handlers on phones) pass straight through.
 */
export function CollageOrchid({ className, ...rest }: ComponentPropsWithoutRef<'img'>) {
  return (
    <img
      src={orchidImg}
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      {...rest}
      className={className ? `${styles.orchid} ${className}` : styles.orchid}
    />
  )
}
