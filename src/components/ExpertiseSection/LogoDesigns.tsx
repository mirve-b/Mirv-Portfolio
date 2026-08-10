import { motion } from 'framer-motion'
import curdonLogo from '../../assets/UI-UX/LOGOS/curdon.webp'
import danykLogo from '../../assets/UI-UX/LOGOS/danyk.webp'
import zentLogo from '../../assets/UI-UX/LOGOS/zent.webp'
import zentPrimaryLogo from '../../assets/UI-UX/LOGOS/zent_primary.webp'
import styles from './ExpertiseSection.module.css'

const LOGOS = [
  { id: 'curdon', src: curdonLogo, alt: 'Curdon logo' },
  { id: 'danyk', src: danykLogo, alt: 'Danyk logo' },
  { id: 'zent', src: zentLogo, alt: 'Zent logo' },
  { id: 'zent-primary', src: zentPrimaryLogo, alt: 'Zent primary logo' },
] as const

const logoHoverSpring = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 16,
  mass: 0.7,
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
            className={styles.logoItem}
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
