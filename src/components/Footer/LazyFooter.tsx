import { lazy, Suspense, useEffect, useRef, useState, type ComponentProps } from 'react'
import styles from './LazyFooter.module.css'

// the footer's code (form, mascot, links) is its own chunk, fetched only when it's needed
const Footer = lazy(() => import('./Footer').then((m) => ({ default: m.Footer })))

/**
 * Holds the footer's place with an empty block and only loads and mounts the real footer once
 * the visitor scrolls within ~600px of it. Until then none of it exists on the page.
 */
export function LazyFooter(props: ComponentProps<typeof Footer>) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    if (near) return
    const el = anchorRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setNear(true)
        observer.disconnect()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [near])

  if (!near) return <div ref={anchorRef} className={styles.placeholder} aria-hidden="true" />

  return (
    <Suspense fallback={<div className={styles.placeholder} aria-hidden="true" />}>
      <Footer {...props} />
    </Suspense>
  )
}
