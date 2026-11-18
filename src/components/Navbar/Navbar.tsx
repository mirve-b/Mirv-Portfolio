import { useCallback, useEffect, useState, type MouseEvent } from 'react'
import { NowPlaying } from '../NowPlaying'
import type { ExpertiseCategory } from '../../lib/pageNavigation'
import { useLiteMedia } from '../../lib/useLiteMedia'
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
  // the top bar slides in once the hero wordmark has scrolled away. Always on off the home page,
  // and on phones and low-powered devices, where the hero is still and the bar is there from the start
  const lite = useLiteMedia()
  const alwaysShown = !isHome || lite
  const [barShown, setBarShown] = useState(alwaysShown)
  useEffect(() => {
    if (alwaysShown) {
      setBarShown(true)
      return
    }
    // checked at most once per frame, and React only hears about it when it actually flips
    let frame = 0
    let shown: boolean | null = null
    const update = () => {
      frame = 0
      const next = window.scrollY > window.innerHeight * 0.35
      if (next === shown) return
      shown = next
      setBarShown(next)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [alwaysShown])

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
