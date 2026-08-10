import { motion } from 'framer-motion'
import curdonLogo from '../../assets/UI-UX/LOGOS/curdon.webp'
import danykLogo from '../../assets/UI-UX/LOGOS/danyk.webp'
import zentLogo from '../../assets/UI-UX/LOGOS/zent.webp'
import zentPLogo from '../../assets/UI-UX/LOGOS/zent_p.webp'
import styles from './ExpertiseSection.module.css'

type LogoSize = 'lg' | 'xl'

type LogoItem = {
  id: string
  src: string
  alt: string
  size?: LogoSize
}

const LOGOS: LogoItem[] = [
  { id: 'curdon', src: curdonLogo, alt: 'Curdon logo' },
  { id: 'danyk', src: danykLogo, alt: 'Danyk logo', size: 'lg' },
  { id: 'zent', src: zentLogo, alt: 'Zent logo' },
  {
    id: 'zent-p',
    src: zentPLogo,
    alt: 'Zent logo',
    size: 'xl',
  },
]

const logoHoverSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 16,
  mass: 0.7,
}

function logoSizeClass(size?: LogoSize) {
  if (size === 'xl') return ` ${styles.logoItemXl}`
  if (size === 'lg') return ` ${styles.logoItemLg}`
  return ''
}

export function LogoDesigns() {
  return (
    <section className={styles.logoSection} aria-labelledby="logo-designs-heading">
      <h3 id="logo-designs-heading" className={styles.logoSectionTitle}>
        Logo Designs:
      </h3>
      <div className={styles.logoGrid}>
        {LOGOS.map((logo) => (
          <motion.div
            key={logo.id}
            className={`${styles.logoItem}${logoSizeClass(logo.size)}`}
            whileHover={{ scale: 1.12, y: -6 }}
            whileTap={{ scale: 0.96 }}
            transition={logoHoverSpring}
          >
            <img
              src={logo.src}
              alt={logo.alt}
              className={styles.logoImage}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </motion.div>
        ))}
      </div>
    </section>
  )
}
