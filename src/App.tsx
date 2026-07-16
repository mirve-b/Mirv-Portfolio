import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
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
import { useIsMobile } from './lib/useIsMobile'
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
  const isMobile = useIsMobile()
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

  routeRef.current = route

  const pageMotionEnabled = !isMobile && routeMotion !== 'none'
  const pageTransition = pageMotionEnabled ? pageSlideTween : instantTransition

  useEffect(() => {
    syncBrowserHistory(routeRef.current, 'replace')
    historyReady.current = true
  }, [])

  useEffect(() => {
    storeRoute(route)
  }, [route])

  useEffect(() => {
    if (!isMobile || !visited.expertise) return
    void import('./components/ProjectGallery')
    void import('./components/ProjectCaseStudy')
  }, [isMobile, visited.expertise])

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

      const previousDepth = routeDepth(previous)
      const nextDepth = routeDepth(next)
      slideDirection.current = nextDepth >= previousDepth ? 1 : -1

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

    const meta = getProjectMetaById(route.projectId)
    if (!meta) return

    const cached = projectCache.current.get(route.projectId)
    if (cached) {
      setLoadedProject(cached)
      return
    }

    const requestId = ++projectLoadRequest.current

    loadProjectAssets(route.projectId).then((assets) => {
      if (projectLoadRequest.current !== requestId) return
      const merged = mergeProjectWithAssets(meta, assets)
      projectCache.current.set(route.projectId, merged)
      setLoadedProject(merged)
    })
  }, [route])

  const applyRoute = useCallback(
    (next: AppRoute, mode: 'push' | 'replace') => {
      if (historyReady.current) {
        syncBrowserHistory(next, mode)
      }
      setRoute(next)
      window.scrollTo({ top: 0, behavior: 'auto' })
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
      setRouteMotion(isMobile ? 'none' : 'home-to-expertise')
      setVisited((current) => ({ ...current, expertise: true }))
      navigate({ type: 'expertise', category })
    },
    [isMobile, navigate],
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
      setTabPanelMotionEnabled(!isMobile)
      setRouteMotion('none')
      replaceRoute({ type: 'expertise', category })
    },
    [isMobile, replaceRoute, route],
  )

  const openProject = useCallback(
    (projectId: string) => {
      const project = getProjectMetaById(projectId)
      if (!project || !isProjectOpenable(project)) return
      slideDirection.current = 1
      setTabPanelMotionEnabled(false)
      setRouteMotion(isMobile ? 'none' : 'expertise-to-project')
      setVisited((current) => ({ ...current, project: true }))
      navigate({ type: 'project', projectId })
    },
    [isMobile, navigate],
  )

  const backToExpertise = useCallback((_category: ExpertiseCategory) => {
    slideDirection.current = -1
    setTabPanelMotionEnabled(false)
    setRouteMotion('none')
    window.history.back()
  }, [])

  const activeProjectMeta =
    route.type === 'project' ? getProjectMetaById(route.projectId) : undefined

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
  const isExpertiseStack = isExpertise || isProject

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
    if (isMobile || !tabPanelMotionEnabled) return

    const timer = window.setTimeout(() => {
      setTabPanelMotionEnabled(false)
    }, 320)

    return () => window.clearTimeout(timer)
  }, [isMobile, tabPanelMotionEnabled, expertiseCategory])

  useEffect(() => {
    if (isMobile || routeMotion === 'none') return

    const timer = window.setTimeout(() => {
      setRouteMotion('none')
    }, 360)

    return () => window.clearTimeout(timer)
  }, [isMobile, routeMotion])

  const projectView =
    loadedProject && activeProjectMeta ? (
      loadedProject.detailType === 'case-study' ? (
        <ProjectCaseStudy
          project={loadedProject}
          onBack={() => backToExpertise(activeProjectMeta.category)}
        />
      ) : (
        <ProjectGallery
          project={loadedProject}
          onBack={() => backToExpertise(activeProjectMeta.category)}
        />
      )
    ) : null

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
                data-mobile={isMobile ? 'true' : undefined}
                data-stacked={!isMobile && visited.expertise ? 'true' : undefined}
              >
                {isMobile ? (
                  <>
                    <div
                      className={styles.viewLayer}
                      data-active={isHome ? 'true' : undefined}
                      aria-hidden={!isHome}
                      {...(!isHome ? { inert: true as const } : {})}
                    >
                      <Hero active={isHome} />
                      <TaglineDivider />
                      <AboutSection
                        onSelectCategory={navigateToExpertise}
                        isHomeActive={isHome}
                      />
                    </div>

                    {visited.expertise ? (
                      <div
                        className={styles.viewLayer}
                        data-active={isExpertise ? 'true' : undefined}
                        aria-hidden={!isExpertise}
                        {...(!isExpertise ? { inert: true as const } : {})}
                      >
                        <ExpertiseSection
                          category={expertiseCategory}
                          onCategoryChange={handleCategoryChange}
                          onOpenProject={openProject}
                          tabDirection={tabDirection}
                          entranceMotionEnabled={false}
                          tabPanelMotionEnabled={false}
                        />
                      </div>
                    ) : null}

                    {visited.project ? (
                      <div
                        className={styles.viewLayer}
                        data-active={isProject ? 'true' : undefined}
                        aria-hidden={!isProject}
                        {...(!isProject ? { inert: true as const } : {})}
                      >
                        <Suspense fallback={null}>{projectView}</Suspense>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <motion.div
                      className={styles.viewLayer}
                      aria-hidden={!isHome}
                      data-offscreen={
                        !isHome && routeMotion === 'none' ? 'true' : undefined
                      }
                      {...(!isHome ? { inert: true as const } : {})}
                      initial={false}
                      animate={{ x: homeOffset }}
                      transition={pageTransition}
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
                        className={`${styles.viewLayer} ${styles.viewLayerExpertise}`}
                        aria-hidden={!isExpertiseStack}
                        data-offscreen={
                          isHome && routeMotion === 'none' ? 'true' : undefined
                        }
                        {...(!isExpertiseStack ? { inert: true as const } : {})}
                        initial={false}
                        animate={{ x: expertiseOffset }}
                        transition={pageTransition}
                      >
                        <div
                          className={styles.expertiseUnderlay}
                          data-hidden={isProject ? 'true' : undefined}
                          aria-hidden={isProject}
                        >
                          <ExpertiseSection
                            category={expertiseCategory}
                            onCategoryChange={handleCategoryChange}
                            onOpenProject={openProject}
                            tabDirection={tabDirection}
                            entranceMotionEnabled={
                              routeMotion === 'home-to-expertise'
                            }
                            tabPanelMotionEnabled={tabPanelMotionEnabled}
                          />
                        </div>

                        {visited.project ? (
                          <motion.div
                            className={styles.projectLayer}
                            aria-hidden={!isProject}
                            {...(!isProject ? { inert: true as const } : {})}
                            initial={false}
                            animate={{ x: projectOffset }}
                            transition={pageTransition}
                          >
                            <Suspense fallback={null}>{projectView}</Suspense>
                          </motion.div>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </>
                )}
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
