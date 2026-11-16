import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { NowPlaying } from '../NowPlaying'
import type { ExpertiseCategory } from '../../lib/pageNavigation'
import styles from './Navbar.module.css'

type NavbarProps = {
  isHome: boolean
  /** The work page being viewed, underlined in the bar. */
  activeCategory?: ExpertiseCategory
  onNavigateHome: () => void
  onSelectCategory: (category: ExpertiseCategory) => void
}

const LINKS: { label: string; category: ExpertiseCategory }[] = [
  { label: 'Art', category: 'art' },
  { label: 'Development', category: 'development' },
  { label: 'Design', category: 'ui-ux' },
]

export function Navbar({ isHome, activeCategory, onNavigateHome, onSelectCategory }: NavbarProps) {
  // the top bar slides in once the hero wordmark has scrolled away (always on, off the home page)
  const [barShown, setBarShown] = useState(!isHome)
  useEffect(() => {
    if (!isHome) {
      setBarShown(true)
      return
    }
    const update = () => setBarShown(window.scrollY > window.innerHeight * 0.35)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [isHome])

  const handleBrandClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      if (isHome) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      onNavigateHome()
    },
    [isHome, onNavigateHome],
  )

  return (
    <header className={styles.navbar}>
      <div className={styles.topBar} data-shown={barShown ? '' : undefined} aria-hidden={!barShown}>
        <a href="/" className={styles.barBrand} onClick={handleBrandClick} tabIndex={barShown ? 0 : -1}>
          <span className={styles.barMark}>MIRVÉ</span>
          <span className={styles.barRule} aria-hidden="true" />
          <span className={styles.barRole}>Designer × Engineer</span>
        </a>
        <nav className={styles.barLinks} aria-label="Work">
          {LINKS.map((link) => (
            <button
              key={link.category}
              type="button"
              className={styles.barLink}
              data-active={activeCategory === link.category ? '' : undefined}
              aria-current={activeCategory === link.category ? 'page' : undefined}
              onClick={() => {
                if (activeCategory === link.category) window.scrollTo({ top: 0, behavior: 'smooth' })
                else onSelectCategory(link.category)
              }}
              tabIndex={barShown ? 0 : -1}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>

      <div className={styles.container}>
        <div className={styles.nowPlayingWrap}>
          <NowPlaying />
        </div>
      </div>

    </header>
  )
}
