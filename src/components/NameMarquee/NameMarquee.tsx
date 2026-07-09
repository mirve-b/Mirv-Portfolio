import styles from './NameMarquee.module.css'

const ITEMS = Array.from({ length: 8 }, () => 'MIRVÉ')

export function NameMarquee() {
  return (
    <section className={styles.section} aria-hidden="true">
      <div className={styles.track}>
        <div className={styles.content}>
          {ITEMS.map((word, index) => (
            <span key={`a-${index}`} className={styles.word}>
              {word}
            </span>
          ))}
        </div>
        <div className={styles.content} aria-hidden="true">
          {ITEMS.map((word, index) => (
            <span key={`b-${index}`} className={styles.word}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
