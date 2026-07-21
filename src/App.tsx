import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  loadCategoryThumbnails,
  loadProjectAssets,
  mergeProjectWithAssets,
} from './data/projectAssets'
import {
  getProjectMetaById,
  isProjectOpenable,
  type PortfolioProject,
} from './data/portfolioProjects'
import { CustomPointer } from './components/CustomPointer'
import { EntryPfp } from './components/EntryPfp'
import { AboutSection } from './components/AboutSection'
import { ExpertiseSection } from './components/ExpertiseSection'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { IntroSplash } from './components/IntroSplash'
import { NameMarquee } from './components/NameMarquee'
import { Navbar } from './components/Navbar'
import { TaglineDivider } from './components/TaglineDivider'
import { hasSeenIntro, markIntroSeen } from './lib/introStorage'
import { pageSlideTween } from './lib/motion'
import { preloadSpotifyIframeApi } from './components/NowPlaying/spotifyPreload'
import {
  type AppRoute,
  type ExpertiseCategory,
  expertiseTabDirection,
  getInitialRoute,
  pathToRoute,
  readRouteFromHistoryState,
  routeDepth,
  storeRoute,
  syncBrowserHistory,
} from './lib/pageNavigation'
import styles from './App.module.css'

const ProjectGallery = lazy(() =>
  import('./components/ProjectGallery').then((m) => ({ default: m.ProjectGallery })),
)

const instantTransition = { duration: 0 }

const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
  }),
  animate: {
    x: 0,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
  }),
}

function App() {
  const skipIntro = hasSeenIntro()
  const [showContent, setShowContent] = useState(skipIntro)
  const [showSplash, setShowSplash] = useState(!skipIntro)
  const [route, setRoute] = useState<AppRoute>(() => getInitialRoute())
  const [loadedProject, setLoadedProject] = useState<PortfolioProject | null>(null)
  const [tabPanelMotionEnabled, setTabPanelMotionEnabled] = useState(false)
  const [transitionDirection, setTransitionDirection] = useState(1)
  const [transitionInstant, setTransitionInstant] = useState(false)
  const [expertiseEntranceActive, setExpertiseEntranceActive] = useState(false)
  const [expertiseEntrancePending, setExpertiseEntrancePending] = useState(false)
  const expertiseEntrancePendingRef = useRef(false)
  const [tabDirection, setTabDirection] = useState(1)
  const routeRef = useRef(route)
  const projectLoadRequest = useRef(0)
  const projectCache = useRef<Map<string, PortfolioProject>>(new Map())
  const galleryEntranceRef = useRef(false)
  const historyReady = useRef(false)

  routeRef.current = route

  const pageTransition = transitionInstant ? instantTransition : pageSlideTween
  const slideCompleteRef = useRef(false)

  useEffect(() => {
    syncBrowserHistory(routeRef.current, 'replace')
    historyReady.current = true
  }, [])

  useEffect(() => {
    if (!showContent) return
    void preloadSpotifyIframeApi()
    void loadCategoryThumbnails('development')
  }, [showContent])

  useEffect(() => {
    storeRoute(route)
  }, [route])

  useEffect(() => {
    if (route.type === 'home') return
    void import('./components/ProjectGallery')
    void loadCategoryThumbnails('development')
  }, [route.type])

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const previous = routeRef.current
      const next =
        readRouteFromHistoryState(event.state) ??
        pathToRoute(window.location.pathname) ??
        { type: 'home' }

      if (
        next.type === previous.type &&
        (next.type === 'home' ||
          (next.type === 'expertise' &&
            previous.type === 'expertise' &&
            next.category === previous.category) ||
          (next.type === 'project' &&
            previous.type === 'project' &&
            next.projectId === previous.projectId))
      ) {
        return
      }

      setTransitionInstant(true)
      setTabPanelMotionEnabled(false)
      setExpertiseEntranceActive(false)
      setExpertiseEntrancePending(false)
      expertiseEntrancePendingRef.current = false
      setTransitionDirection(routeDepth(next) >= routeDepth(previous) ? 1 : -1)

      if (
        previous.type === 'expertise' &&
        next.type === 'expertise' &&
        previous.category !== next.category
      ) {
        setTabDirection(expertiseTabDirection(previous.category, next.category))
        setTabPanelMotionEnabled(true)
      }

      setRoute(next)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (route.type !== 'project') return

    const { projectId } = route
    const meta = getProjectMetaById(projectId)
    if (!meta) return

    const cached = projectCache.current.get(projectId)
    if (cached) {
      setLoadedProject(cached)
      return
    }

    galleryEntranceRef.current = true
    setLoadedProject(null)

    const requestId = ++projectLoadRequest.current

    loadProjectAssets(projectId)
      .then((assets) => {
        if (projectLoadRequest.current !== requestId) return
        const merged = mergeProjectWithAssets(meta, assets)
        projectCache.current.set(projectId, merged)
        setLoadedProject(merged)
      })
      .catch(() => {
        if (projectLoadRequest.current !== requestId) return
        const next = { type: 'home' as const }
        syncBrowserHistory(next, 'replace')
        setTransitionInstant(true)
        setRoute(next)
      })
  }, [route])

  const applyRoute = useCallback((next: AppRoute, mode: 'push' | 'replace') => {
    if (historyReady.current) {
      syncBrowserHistory(next, mode)
    }
    setRoute(next)
  }, [])

  const navigate = useCallback(
    (next: AppRoute) => {
      applyRoute(next, 'push')
    },
    [applyRoute],
  )

  const replaceRoute = useCallback(
    (next: AppRoute) => {
      applyRoute(next, 'replace')
    },
    [applyRoute],
  )

  const handleIntroReveal = useCallback(() => {
    markIntroSeen()
    setShowContent(true)
  }, [])

  const handleIntroExitComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const beginAnimatedNavigation = useCallback((direction: number) => {
    setTransitionDirection(direction)
    setTransitionInstant(false)
  }, [])

  const navigateToExpertise = useCallback(
    (category: ExpertiseCategory) => {
      beginAnimatedNavigation(1)
      setTabDirection(1)
      setTabPanelMotionEnabled(false)
      setExpertiseEntrancePending(true)
      expertiseEntrancePendingRef.current = true
      setExpertiseEntranceActive(false)
      navigate({ type: 'expertise', category })
    },
    [beginAnimatedNavigation, navigate],
  )

  const navigateHome = useCallback(() => {
    if (routeRef.current.type === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setTransitionDirection(-1)
    setTransitionInstant(true)
    setTabPanelMotionEnabled(false)
    setExpertiseEntranceActive(false)
    navigate({ type: 'home' })
  }, [navigate])

  const handleCategoryChange = useCallback(
    (category: ExpertiseCategory) => {
      if (route.type !== 'expertise') return
      setTabDirection(expertiseTabDirection(route.category, category))
      setTabPanelMotionEnabled(true)
      setTransitionInstant(true)
      setExpertiseEntranceActive(false)
      replaceRoute({ type: 'expertise', category })
    },
    [replaceRoute, route],
  )

  const openProject = useCallback(
    (projectId: string) => {
      const project = getProjectMetaById(projectId)
      if (!project || !isProjectOpenable(project)) return

      beginAnimatedNavigation(1)
      setTabPanelMotionEnabled(false)
      setExpertiseEntranceActive(false)
      setExpertiseEntrancePending(false)
      expertiseEntrancePendingRef.current = false

      const cached = projectCache.current.get(projectId)
      galleryEntranceRef.current = cached == null
      setLoadedProject(cached ?? null)

      navigate({ type: 'project', projectId })
    },
    [beginAnimatedNavigation, navigate],
  )

  const backToExpertise = useCallback((_category: ExpertiseCategory) => {
    setTransitionInstant(true)
    setTabPanelMotionEnabled(false)
    setExpertiseEntranceActive(false)
    window.history.back()
  }, [])

  const activeProjectMeta =
    route.type === 'project' ? getProjectMetaById(route.projectId) : undefined

  const projectReady =
    route.type === 'project' &&
    loadedProject != null &&
    activeProjectMeta != null &&
    loadedProject.id === activeProjectMeta.id

  useEffect(() => {
    if (route.type === 'project' && !activeProjectMeta) {
      const next = { type: 'home' as const }
      syncBrowserHistory(next, 'replace')
      setTransitionInstant(true)
      setRoute(next)
    }
  }, [route, activeProjectMeta])

  const isHome = route.type === 'home'
  const isProject = route.type === 'project'

  const expertiseCategory: ExpertiseCategory =
    route.type === 'expertise'
      ? route.category
      : route.type === 'project' && activeProjectMeta
        ? activeProjectMeta.category
        : 'art'

  useEffect(() => {
    if (!tabPanelMotionEnabled) return

    const timer = window.setTimeout(() => {
      setTabPanelMotionEnabled(false)
    }, 320)

    return () => window.clearTimeout(timer)
  }, [tabPanelMotionEnabled, expertiseCategory])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  useLayoutEffect(() => {
    if (route.type !== 'home') return

    const frame = window.requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'))
    })

    return () => window.cancelAnimationFrame(frame)
  }, [route])

  useEffect(() => {
    slideCompleteRef.current = false
  }, [route, transitionInstant])

  const handlePageSlideComplete = useCallback(() => {
    if (!expertiseEntrancePendingRef.current) return

    expertiseEntrancePendingRef.current = false
    setExpertiseEntrancePending(false)
    setExpertiseEntranceActive(true)
  }, [])

  const projectView =
    projectReady && activeProjectMeta ? (
      <ProjectGallery
        key={loadedProject.id}
        project={loadedProject}
        onBack={() => backToExpertise(activeProjectMeta.category)}
      />
    ) : null

  const pageKey =
    route.type === 'home'
      ? 'home'
      : route.type === 'expertise'
        ? 'expertise'
        : `project-${route.projectId}`

  return (
    <div className={styles.app}>
      <CustomPointer />
      {showContent ? (
        <>
          <EntryPfp active={showContent && isHome} />
          <main className={styles.main}>
            <div className={styles.heroWrap}>
              <Navbar isHome={isHome} onNavigateHome={navigateHome} />

              <div className={styles.viewStage}>
                <AnimatePresence
                  initial={false}
                  mode="popLayout"
                  custom={transitionDirection}
                >
                  <motion.div
                    key={pageKey}
                    className={`${styles.pageLayer}${
                      route.type === 'project' ? ` ${styles.pageProject}` : ''
                    }`}
                    custom={transitionDirection}
                    variants={pageVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={pageTransition}
                    onAnimationComplete={() => {
                      if (transitionInstant || slideCompleteRef.current) return
                      slideCompleteRef.current = true
                      handlePageSlideComplete()
                    }}
                  >
                    {route.type === 'home' ? (
                      <>
                        <Hero active />
                        <TaglineDivider />
                        <AboutSection
                          onSelectCategory={navigateToExpertise}
                          isHomeActive
                        />
                      </>
                    ) : null}

                    {route.type === 'expertise' ? (
                      <ExpertiseSection
                        category={route.category}
                        onCategoryChange={handleCategoryChange}
                        onOpenProject={openProject}
                        tabDirection={tabDirection}
                        hideCards={expertiseEntrancePending}
                        entranceMotionEnabled={expertiseEntranceActive}
                        tabPanelMotionEnabled={tabPanelMotionEnabled}
                      />
                    ) : null}

                    {route.type === 'project' ? (
                      <Suspense
                        fallback={
                          <div className={styles.pageLoading}>
                            <span className={styles.pageLoadingSpinner} />
                          </div>
                        }
                      >
                        {projectView ? (
                          galleryEntranceRef.current ? (
                            <motion.div
                              key={`gallery-enter-${route.projectId}`}
                              custom={1}
                              variants={pageVariants}
                              initial="initial"
                              animate="animate"
                              transition={pageSlideTween}
                              onAnimationComplete={() => {
                                galleryEntranceRef.current = false
                              }}
                            >
                              {projectView}
                            </motion.div>
                          ) : (
                            projectView
                          )
                        ) : (
                          <div className={styles.pageLoading}>
                            <span className={styles.pageLoadingSpinner} />
                          </div>
                        )}
                      </Suspense>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div
              className={styles.siteChrome}
              data-hidden={isProject ? 'true' : undefined}
              aria-hidden={isProject}
            >
              <NameMarquee />
              <Footer scrollPfpEnabled={isHome} />
            </div>
          </main>
        </>
      ) : null}

      {showSplash ? (
        <IntroSplash
          onReveal={handleIntroReveal}
          onExitComplete={handleIntroExitComplete}
        />
      ) : null}
    </div>
  )
}

export default App
