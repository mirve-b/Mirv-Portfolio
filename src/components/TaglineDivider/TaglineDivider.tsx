import styles from './TaglineDivider.module.css'

export function TaglineDivider() {
  return (
    <section className={styles.section} aria-label="Tagline">
      <div className={styles.divider}>
        <span className={styles.line}>
          <span className={styles.dot} />
        </span>
        <p className={styles.text}>
          Part engineer, part illustrator, entirely curious
        </p>
        <span className={styles.line}>
          <span className={styles.dot} />
        </span>
      </div>
    </section>
  )
}
