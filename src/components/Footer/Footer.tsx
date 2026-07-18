import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ScrollPfp } from '../ScrollPfp'
import { staggerContainer } from '../../lib/motion'
import { ContactForm } from './ContactForm'
import { CONTACT_EMAIL, SOCIAL_LINKS } from './constants'
import { EmailIcon, SocialIcon } from './SocialIcons'
import styles from './Footer.module.css'

const springBounce = { type: 'spring' as const, stiffness: 400, damping: 13 }

export function Footer({ scrollPfpEnabled = true }: { scrollPfpEnabled?: boolean }) {
  const footerRef = useRef<HTMLElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  return (
    <footer ref={footerRef} className={styles.footer} aria-labelledby="footer-heading">
      <div className={styles.container}>
        <motion.div
          className={styles.connectCol}
          variants={staggerContainer(0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.h2 id="footer-heading" className={styles.heading} variants={springItem}>
            Let&apos;s connect
          </motion.h2>

          <motion.p className={styles.subtext} variants={springItem}>
            Open to collaborations, freelance work, and creative projects.
          </motion.p>

          <motion.ul className={styles.socialList} variants={springItem}>
            {SOCIAL_LINKS.map(({ id, label, href }) => (
              <li key={id}>
                <motion.a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={label}
                  whileHover={{ scale: 1.14, y: -5, rotate: -3 }}
                  whileTap={{ scale: 0.92 }}
                  transition={springBounce}
                >
                  <SocialIcon id={id} />
                </motion.a>
              </li>
            ))}
            <li>
              <motion.a
                href={`mailto:${CONTACT_EMAIL}`}
                className={styles.socialLink}
                aria-label={`Email ${CONTACT_EMAIL}`}
                whileHover={{ scale: 1.14, y: -5, rotate: -3 }}
                whileTap={{ scale: 0.92 }}
                transition={springBounce}
              >
                <EmailIcon />
              </motion.a>
            </li>
          </motion.ul>
        </motion.div>

        <motion.div
          className={styles.formCol}
          initial={{ opacity: 0, x: 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ ...springBounce, delay: 0.1 }}
        >
          <ContactForm nameInputRef={nameInputRef} />
        </motion.div>
      </div>

      {scrollPfpEnabled ? (
        <ScrollPfp zoneRef={footerRef} mobileNameInputRef={nameInputRef} />
      ) : null}

      <motion.p
        className={styles.copyright}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        © {new Date().getFullYear()} MIRVÉ — All rights reserved
      </motion.p>
    </footer>
  )
}

const springItem = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 380, damping: 16 },
  },
}
