import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

const ExpertiseSection = lazy(() =>
  import('./components/ExpertiseSection').then((m) => ({ default: m.ExpertiseSection })),
)
const ProjectGallery = lazy(() =>
  import('./components/ProjectGallery').then((m) => ({ default: m.ProjectGallery })),
)
const ProjectCaseStudy = lazy(() =>
  import('./components/ProjectCaseStudy').then((m) => ({ default: m.ProjectCaseStudy })),
)

function App() {
  const skipIntro = hasSeenIntro()
  const [showContent, setShowContent] = useState(skipIntro)
  const [showSplash, setShowSplash] = useState(!skipIntro)
  const [route, setRoute] = useState<AppRoute>(() => getInitialRoute())
  const [loadedProject, setLoadedProject] = useState<PortfolioProject | null>(null)
  const slideDirection = useRef(1)
  const [tabDirection, setTabDirection] = useState(1)
  const routeRef = useRef(route)
  const restoredFromStorage = useRef(getInitialRoute().type !== 'home')
  const expertiseEnterFromSide = useRef(false)
  const projectLoadRequest = useRef(0)
  const historyReady = useRef(false)

  routeRef.current = route

  useEffect(() => {
    syncBrowserHistory(routeRef.current, 'replace')
    historyReady.current = true
  }, [])

  useEffect(() => {
    storeRoute(route)
  }, [route])

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const previous = routeRef.current
      const next =
        readRouteFromHistoryState(event.state) ??
        pathToRoute(window.location.pathname) ??
        { type: 'home' }

      const previousDepth = routeDepth(previous)
      const nextDepth = routeDepth(next)
      slideDirection.current = nextDepth >= previousDepth ? 1 : -1
      restoredFromStorage.current = false
      expertiseEnterFromSide.current =
        next.type === 'expertise' && previous.type === 'home'

      if (
        previous.type === 'expertise' &&
        next.type === 'expertise' &&
        previous.category !== next.category
      ) {
        setTabDirection(expertiseTabDirection(previous.category, next.category))
      }

      setRoute(next)
      window.scrollTo({ top: 0, behavior: 'auto' })
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (route.type !== 'project') {
      setLoadedProject(null)
      return
    }

    const meta = getProjectMetaById(route.projectId)
    if (!meta) {
      setLoadedProject(null)
      return
    }

    const requestId = ++projectLoadRequest.current

    loadProjectAssets(route.projectId).then((assets) => {
      if (projectLoadRequest.current === requestId) {
        setLoadedProject(mergeProjectWithAssets(meta, assets))
      }
    })
  }, [route])

  const navigate = useCallback((next: AppRoute) => {
    if (historyReady.current) {
      syncBrowserHistory(next, 'push')
    }
    setRoute(next)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  const handleIntroReveal = useCallback(() => {
    markIntroSeen()
    setShowContent(true)
  }, [])

  const handleIntroExitComplete = useCallback(() => {
    setShowSplash(false)
  }, [])

  const navigateToExpertise = useCallback(
    (category: ExpertiseCategory) => {
      restoredFromStorage.current = false
      slideDirection.current = 1
      expertiseEnterFromSide.current = true
      setTabDirection(1)
      navigate({ type: 'expertise', category })
    },
    [navigate],
  )

  const navigateHome = useCallback(() => {
    restoredFromStorage.current = false
    slideDirection.current = -1
    expertiseEnterFromSide.current = false
    navigate({ type: 'home' })
  }, [navigate])

  const handleCategoryChange = useCallback(
    (category: ExpertiseCategory) => {
      if (route.type !== 'expertise') return
      restoredFromStorage.current = false
      setTabDirection(expertiseTabDirection(route.category, category))
      navigate({ type: 'expertise', category })
    },
    [navigate, route],
  )

  const openProject = useCallback(
    (projectId: string) => {
      const project = getProjectMetaById(projectId)
      if (!project || !isProjectOpenable(project)) return
      restoredFromStorage.current = false
      slideDirection.current = 1
      expertiseEnterFromSide.current = false
      navigate({ type: 'project', projectId })
    },
    [navigate],
  )

  const backToExpertise = useCallback(
    (category: ExpertiseCategory) => {
      restoredFromStorage.current = false
      slideDirection.current = -1
      expertiseEnterFromSide.current = false
      navigate({ type: 'expertise', category })
    },
    [navigate],
  )

  const activeProjectMeta =
    route.type === 'project' ? getProjectMetaById(route.projectId) : undefined

  useEffect(() => {
    if (route.type === 'project' && !activeProjectMeta) {
      const next = { type: 'home' as const }
      syncBrowserHistory(next, 'replace')
      setRoute(next)
    }
  }, [route, activeProjectMeta])

  const isExpertiseStack = route.type === 'expertise' || route.type === 'project'
  const expertiseCategory: ExpertiseCategory =
    route.type === 'expertise'
      ? route.category
      : route.type === 'project' && activeProjectMeta
        ? activeProjectMeta.category
        : 'art'

  const showSiteChrome = route.type !== 'project'

  return (
    <div className={styles.app}>
      <GlassCursor />
      {showContent ? (
        <>
          <EntryPfp active={showContent && route.type === 'home'} />
          <main className={styles.main}>
            <div className={styles.heroWrap}>
              <Navbar
                isHome={route.type === 'home'}
                onNavigateHome={navigateHome}
              />

              <div className={styles.viewStage}>
                <AnimatePresence custom={slideDirection.current}>
                  {route.type === 'home' ? (
                    <motion.div
                      key="home"
                      className={styles.pagePanel}
                      custom={slideDirection.current}
                      initial={{ x: slideDirection.current < 0 ? '-100%' : 0 }}
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={pageSlideTween}
                    >
                      <Hero />
                      <TaglineDivider />
                      <AboutSection onSelectCategory={navigateToExpertise} />
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <AnimatePresence custom={slideDirection.current}>
                  {isExpertiseStack ? (
                    <motion.div
                      key="expertise-stack"
                      className={styles.expertiseStack}
                      custom={slideDirection.current}
                      initial={
                        restoredFromStorage.current
                          ? false
                          : expertiseEnterFromSide.current
                            ? { x: '100%' }
                            : false
                      }
                      animate={{ x: 0 }}
                      exit={{ x: '-100%' }}
                      transition={pageSlideTween}
                      onAnimationComplete={() => {
                        expertiseEnterFromSide.current = false
                      }}
                    >
                      <AnimatePresence
                        mode="wait"
                        custom={slideDirection.current}
                        initial={false}
                      >
                        {route.type === 'expertise' ? (
                          <motion.div
                            key="expertise"
                            className={styles.pagePanel}
                            custom={slideDirection.current}
                            initial={false}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={pageSlideTween}
                          >
                            <Suspense fallback={null}>
                              <ExpertiseSection
                                category={expertiseCategory}
                                onCategoryChange={handleCategoryChange}
                                onOpenProject={openProject}
                                tabDirection={tabDirection}
                                motionEnabled
                              />
                            </Suspense>
                          </motion.div>
                        ) : null}

                        {route.type === 'project' && activeProjectMeta ? (
                          <motion.div
                            key={`project-${activeProjectMeta.id}`}
                            className={styles.pagePanel}
                            custom={slideDirection.current}
                            initial={
                              restoredFromStorage.current ? false : { x: '100%' }
                            }
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={pageSlideTween}
                          >
                            <Suspense fallback={null}>
                              {loadedProject ? (
                                loadedProject.detailType === 'case-study' ? (
                                  <ProjectCaseStudy
                                    project={loadedProject}
                                    onBack={() =>
                                      backToExpertise(activeProjectMeta.category)
                                    }
                                  />
                                ) : (
                                  <ProjectGallery
                                    project={loadedProject}
                                    onBack={() =>
                                      backToExpertise(activeProjectMeta.category)
                                    }
                                  />
                                )
                              ) : null}
                            </Suspense>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>

            {showSiteChrome ? (
              <div className={styles.siteChrome}>
                <NameMarquee />
                <Footer />
              </div>
            ) : null}
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
