import { motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '../../lib/useReducedMotion'
import styles from './SplitText.module.css'

const MOTION_TAGS = {
  span: motion.span,
  p: motion.p,
  h1: motion.h1,
  h2: motion.h2,
} as const

type SplitTextProps = {
  text: string
  as?: keyof typeof MOTION_TAGS
  className?: string
  id?: string
  /** Seconds before the first letter moves. */
  delay?: number
  /** Seconds between letters. */
  stagger?: number
  /** Animate when scrolled into view instead of on mount. */
  inView?: boolean
}

const letterVariants: Variants = {
  hidden: { y: '110%', opacity: 0, rotate: 6, filter: 'blur(6px)' },
  visible: {
    y: '0%',
    opacity: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
  },
}

/**
 * Letter-by-letter masked rise. Keeps the full string for screen readers and
 * inherits every typographic style from `className`, so it never changes the look.
 */
export function SplitText({
  text,
  as = 'span',
  className,
  id,
  delay = 0,
  stagger = 0.045,
  inView = false,
}: SplitTextProps) {
  const reduced = useReducedMotion()
  const Tag = MOTION_TAGS[as]

  if (reduced) {
    const Plain = as
    return (
      <Plain className={className} id={id}>
        {text}
      </Plain>
    )
  }

  const words = text.split(' ')
  let index = 0

  const trigger = inView
    ? { whileInView: 'visible', viewport: { once: true, margin: '-40px' } }
    : { animate: 'visible' }

  return (
    <Tag
      className={className}
      id={id}
      aria-label={text}
      initial="hidden"
      {...trigger}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className={styles.word} aria-hidden="true">
          {Array.from(word).map((char) => {
            const key = index++
            return (
              <span key={key} className={styles.mask}>
                <motion.span className={styles.char} variants={letterVariants}>
                  {char}
                </motion.span>
              </span>
            )
          })}
          {wordIndex < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </Tag>
  )
}
