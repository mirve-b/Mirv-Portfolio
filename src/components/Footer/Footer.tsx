import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ScrollPfp } from '../ScrollPfp'
import { useIsMobile } from '../../lib/useIsMobile'
import { useReducedMotion } from '../../lib/useReducedMotion'
import { ContactForm } from './ContactForm'
import { CONTACT_EMAIL, SOCIAL_LINKS } from './constants'
import styles from './Footer.module.css'

const EASE = [0.16, 1, 0.3, 1] as const

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 1, ease: EASE, delay },
})

/** The sign-off: one statement, the email, a line of links, and the form. Nothing else. */
export function Footer({
  scrollPfpEnabled = true,
  scrollPfpKey = 'default',
}: {
  scrollPfpEnabled?: boolean
  /** Remount ScrollPfp on route changes so a previous reveal can't flash. */
  scrollPfpKey?: string
}) {
  const footerRef = useRef<HTMLElement>(null)
  const isMobile = useIsMobile()
  const reduced = useReducedMotion()
  const pfp = scrollPfpEnabled ? (
    <ScrollPfp key={`${scrollPfpKey}-${isMobile ? 'm' : 'd'}`} zoneRef={footerRef} />
  ) : null

  const year = new Date().getFullYear()

  return (
    <footer ref={footerRef} className={styles.footer} aria-labelledby="footer-heading">
      <div className={styles.container}>
        <div className={styles.connectCol}>
          <motion.h2 id="footer-heading" className={styles.heading} {...rise()}>
            <span className={styles.bold}>LET&apos;S</span> <span className={styles.light}>CREATE</span>
          </motion.h2>

          <motion.a className={styles.email} href={`mailto:${CONTACT_EMAIL}`} {...rise(0.1)}>
            {CONTACT_EMAIL}
          </motion.a>

          <motion.ul className={styles.links} aria-label="Elsewhere" {...rise(0.18)}>
            {SOCIAL_LINKS.map(({ id, label, href }) => (
              <li key={id}>
                <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {label}
                </a>
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div className={styles.formCol} {...rise(0.1)}>
          <ContactForm scrollPfp={isMobile ? pfp : null} />
        </motion.div>
      </div>

      {/* Desktop: the mascot slides out from behind the form */}
      {!isMobile ? pfp : null}

      <div className={styles.bottomBar}>
        <span>© {year} MIRVÉ</span>
        <button
          type="button"
          className={styles.toTop}
          onClick={() => window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  )
}
