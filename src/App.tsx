import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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
import { GlassCursor } from './components/GlassCursor'
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
const ProjectCaseStudy = lazy(() =>
  import('./components/ProjectCaseStudy').then((m) => ({
    default: m.ProjectCaseStudy,
  })),
)

type RouteMotionKind = 'home-to-expertise' | 'expertise-to-project' | 'none'

const instantTransition = { duration: 0 }

function initialVisitedState() {
  const initialRoute = getInitialRoute()
  return {
    expertise: initialRoute.type !== 'home',
    project: initialRoute.type === 'project',
  }
}

function App() {
  const skipIntro = hasSeenIntro()
  const [showContent, setShowContent] = useState(skipIntro)
  const [showSplash, setShowSplash] = useState(!skipIntro)
  const [route, setRoute] = useState<AppRoute>(() => getInitialRoute())
  const [visited, setVisited] = useState(initialVisitedState)
  const [loadedProject, setLoadedProject] = useState<PortfolioProject | null>(null)
  const [routeMotion, setRouteMotion] = useState<RouteMotionKind>('none')
  const [tabPanelMotionEnabled, setTabPanelMotionEnabled] = useState(false)
  const slideDirection = useRef(1)
  const [tabDirection, setTabDirection] = useState(1)
  const routeRef = useRef(route)
  const projectLoadRequest = useRef(0)
  const projectCache = useRef<Map<string, PortfolioProject>>(new Map())
  const historyReady = useRef(false)
  const pendingExpertiseEntrance = useRef(false)
  const [expertiseEntranceReady, setExpertiseEntranceReady] = useState(false)

  routeRef.current = route

  const pageTransition = routeMotion === 'none' ? instantTransition : pageSlideTween

  useEffect(() => {
    syncBrowserHistory(routeRef.current, 'replace')
    historyReady.current = true
  }, [])

  useEffect(() => {
    storeRoute(route)
  }, [route])

  useEffect(() => {
    if (!visited.expertise) return
    void import('./components/ProjectGallery')
    void import('./components/ProjectCaseStudy')
    void loadCategoryThumbnails('development')
  }, [visited.expertise])

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

      setRouteMotion('none')
      setTabPanelMotionEnabled(false)

      if (next.type !== 'home') {
        setVisited((current) => ({ ...current, expertise: true }))
      }
      if (next.type === 'project') {
        setVisited((current) => ({ ...current, project: true }))
      }

      slideDirection.current = routeDepth(next) >= routeDepth(previous) ? 1 : -1

      if (
        previous.type === 'expertise' &&
        next.type === 'expertise' &&
        previous.category !== next.category
      ) {
        setTabDirection(expertiseTabDirection(previous.category, next.category))
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

    setLoadedProject(null)

    const requestId = ++projectLoadRequest.current

    loadProjectAssets(projectId).then((assets) => {
      if (projectLoadRequest.current !== requestId) return
      const merged = mergeProjectWithAssets(meta, assets)
      projectCache.current.set(projectId, merged)
      setLoadedProject(merged)
    })
  }, [route])

  const applyRoute = useCallback(
    (next: AppRoute, mode: 'push' | 'replace') => {
      if (historyReady.current) {
        syncBrowserHistory(next, mode)
      }
      setRoute(next)
    },
    [],
  )

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

  const navigateToExpertise = useCallback(
    (category: ExpertiseCategory) => {
      slideDirection.current = 1
      setTabDirection(1)
      setTabPanelMotionEnabled(false)
      setRouteMotion('home-to-expertise')
      pendingExpertiseEntrance.current = true
      setExpertiseEntranceReady(false)
      setVisited((current) => ({ ...current, expertise: true }))
      navigate({ type: 'expertise', category })
    },
    [navigate],
  )

  const navigateHome = useCallback(() => {
    slideDirection.current = -1
    setTabPanelMotionEnabled(false)
    setRouteMotion('none')

    const depth = routeDepth(routeRef.current)
    if (depth > 0) {
      window.history.go(-depth)
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCategoryChange = useCallback(
    (category: ExpertiseCategory) => {
      if (route.type !== 'expertise') return
      setTabDirection(expertiseTabDirection(route.category, category))
      setTabPanelMotionEnabled(true)
      setRouteMotion('none')
      replaceRoute({ type: 'expertise', category })
    },
    [replaceRoute, route],
  )

  const openProject = useCallback(
    (projectId: string) => {
      const project = getProjectMetaById(projectId)
      if (!project || !isProjectOpenable(project)) return

      slideDirection.current = 1
      setTabPanelMotionEnabled(false)
      setRouteMotion('expertise-to-project')
      setVisited((current) => ({ ...current, project: true }))

      const cached = projectCache.current.get(projectId)
      setLoadedProject(cached ?? null)

      navigate({ type: 'project', projectId })
    },
    [navigate],
  )

  const backToExpertise = useCallback((_category: ExpertiseCategory) => {
    slideDirection.current = -1
    setTabPanelMotionEnabled(false)
    setRouteMotion('none')
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
      setRouteMotion('none')
      setRoute(next)
    }
  }, [route, activeProjectMeta])

  const isHome = route.type === 'home'
  const isExpertise = route.type === 'expertise'
  const isProject = route.type === 'project'

  const expertiseCategory: ExpertiseCategory =
    route.type === 'expertise'
      ? route.category
      : route.type === 'project' && activeProjectMeta
        ? activeProjectMeta.category
        : 'art'

  const homeOffset = isHome ? '0%' : '-100%'
  const expertiseOffset = isHome ? '100%' : '0%'
  const projectOffset = isProject ? '0%' : '100%'

  useEffect(() => {
    if (!tabPanelMotionEnabled) return

    const timer = window.setTimeout(() => {
      setTabPanelMotionEnabled(false)
    }, 320)

    return () => window.clearTimeout(timer)
  }, [tabPanelMotionEnabled, expertiseCategory])

  const pageAnimating = routeMotion !== 'none'
  const slideCompleteRef = useRef(false)

  const handlePageSlideComplete = useCallback(() => {
    if (slideCompleteRef.current) return
    slideCompleteRef.current = true
    setRouteMotion('none')

    if (pendingExpertiseEntrance.current) {
      pendingExpertiseEntrance.current = false
      requestAnimationFrame(() => setExpertiseEntranceReady(true))
    }
  }, [])

  useEffect(() => {
    if (isExpertise) return
    pendingExpertiseEntrance.current = false
    setExpertiseEntranceReady(false)
  }, [isExpertise])

  useEffect(() => {
    if (routeMotion === 'none') return
    slideCompleteRef.current = false
  }, [routeMotion])

  useEffect(() => {
    if (routeMotion !== 'none') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route, routeMotion])

  const projectView =
    projectReady && activeProjectMeta ? (
      loadedProject.detailType === 'case-study' ? (
        <ProjectCaseStudy
          key={loadedProject.id}
          project={loadedProject}
          onBack={() => backToExpertise(activeProjectMeta.category)}
        />
      ) : (
        <ProjectGallery
          key={loadedProject.id}
          project={loadedProject}
          onBack={() => backToExpertise(activeProjectMeta.category)}
        />
      )
    ) : null

  const layerInert = (active: boolean) => (!active ? ({ inert: true as const } as const) : {})

  return (
    <div className={styles.app}>
      <GlassCursor />
      {showContent ? (
        <>
          <EntryPfp active={showContent && isHome} />
          <main className={styles.main}>
            <div className={styles.heroWrap}>
              <Navbar isHome={isHome} onNavigateHome={navigateHome} />

              <div
                className={styles.viewStage}
                data-stacked={visited.expertise ? 'true' : undefined}
              >
                <motion.div
                  className={styles.pageLayer}
                  data-page="home"
                  aria-hidden={!isHome}
                  data-active={isHome ? 'true' : undefined}
                  data-offscreen={!isHome && routeMotion === 'none' ? 'true' : undefined}
                  data-animating={pageAnimating ? 'true' : undefined}
                  {...layerInert(isHome)}
                  initial={false}
                  animate={{ x: homeOffset }}
                  transition={pageTransition}
                  onAnimationComplete={
                    pageAnimating ? handlePageSlideComplete : undefined
                  }
                >
                  <Hero active={isHome} />
                  <TaglineDivider />
                  <AboutSection
                    onSelectCategory={navigateToExpertise}
                    isHomeActive={isHome}
                  />
                </motion.div>

                {visited.expertise ? (
                  <motion.div
                    className={`${styles.pageLayer} ${styles.pageExpertise}`}
                    data-page="expertise"
                    aria-hidden={!isExpertise}
                    data-active={isExpertise ? 'true' : undefined}
                    data-offscreen={
                      !isExpertise && routeMotion === 'none' ? 'true' : undefined
                    }
                    data-animating={pageAnimating ? 'true' : undefined}
                    {...layerInert(isExpertise)}
                    initial={false}
                    animate={{ x: expertiseOffset }}
                    transition={pageTransition}
                    onAnimationComplete={
                      pageAnimating ? handlePageSlideComplete : undefined
                    }
                  >
                    <ExpertiseSection
                      category={expertiseCategory}
                      onCategoryChange={handleCategoryChange}
                      onOpenProject={openProject}
                      tabDirection={tabDirection}
                      entranceMotionEnabled={expertiseEntranceReady}
                      tabPanelMotionEnabled={tabPanelMotionEnabled}
                    />
                  </motion.div>
                ) : null}

                {visited.project ? (
                  <motion.div
                    className={`${styles.pageLayer} ${styles.pageProject}`}
                    data-page="project"
                    aria-hidden={!isProject}
                    data-active={isProject ? 'true' : undefined}
                    data-offscreen={
                      !isProject && routeMotion === 'none' ? 'true' : undefined
                    }
                    data-animating={pageAnimating ? 'true' : undefined}
                    {...layerInert(isProject)}
                    initial={false}
                    animate={{ x: projectOffset }}
                    transition={pageTransition}
                    onAnimationComplete={
                      pageAnimating ? handlePageSlideComplete : undefined
                    }
                  >
                    <Suspense fallback={null}>{projectView}</Suspense>
                  </motion.div>
                ) : null}
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
