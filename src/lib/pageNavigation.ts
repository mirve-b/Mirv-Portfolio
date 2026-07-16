/** Expertise categories shown on the Expertise page tab bar. */
export type ExpertiseCategory = 'art' | 'ui-ux' | 'development'

export type AppRoute =
  | { type: 'home' }
  | { type: 'expertise'; category: ExpertiseCategory }
  | { type: 'project'; projectId: string }

/** @deprecated Use AppRoute */
export type ActivePage = ExpertiseCategory | 'home'

export const EXPERTISE_TABS: { id: ExpertiseCategory; label: string }[] = [
  { id: 'art', label: 'Art' },
  { id: 'development', label: 'Development' },
  { id: 'ui-ux', label: 'UI/UX' },
]

export const EXPERTISE_TAB_ORDER: ExpertiseCategory[] = [
  'art',
  'development',
  'ui-ux',
]

export function expertiseTabDirection(
  from: ExpertiseCategory,
  to: ExpertiseCategory,
): number {
  const fromIndex = EXPERTISE_TAB_ORDER.indexOf(from)
  const toIndex = EXPERTISE_TAB_ORDER.indexOf(to)
  return toIndex >= fromIndex ? 1 : -1
}

const ROUTE_KEY = 'mirve-active-route'
const LEGACY_PAGE_KEY = 'mirve-active-page'

const EXPERTISE_PAGES: ExpertiseCategory[] = ['art', 'ui-ux', 'development']

const HISTORY_STATE_KEY = 'mirveRoute'

export type HistoryRouteState = {
  [HISTORY_STATE_KEY]: AppRoute
}

function isExpertiseCategory(value: string): value is ExpertiseCategory {
  return EXPERTISE_PAGES.includes(value as ExpertiseCategory)
}

function isAppRoute(value: unknown): value is AppRoute {
  if (!value || typeof value !== 'object') return false

  const route = value as AppRoute
  if (route.type === 'home') return true
  if (route.type === 'expertise') return isExpertiseCategory(route.category)
  if (route.type === 'project') return typeof route.projectId === 'string' && route.projectId.length > 0
  return false
}

export function routeToPath(route: AppRoute): string {
  if (route.type === 'home') return '/'
  if (route.type === 'expertise') return `/expertise/${route.category}`
  return `/project/${encodeURIComponent(route.projectId)}`
}

export function pathToRoute(pathname: string): AppRoute | null {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (path === '/') return { type: 'home' }

  const expertiseMatch = path.match(/^\/expertise\/(art|ui-ux|development)$/)
  if (expertiseMatch) {
    return { type: 'expertise', category: expertiseMatch[1] as ExpertiseCategory }
  }

  const projectMatch = path.match(/^\/project\/([^/]+)$/)
  if (projectMatch) {
    return {
      type: 'project',
      projectId: decodeURIComponent(projectMatch[1]),
    }
  }

  return null
}

export function readRouteFromHistoryState(state: unknown): AppRoute | null {
  if (!state || typeof state !== 'object') return null
  const candidate = (state as HistoryRouteState)[HISTORY_STATE_KEY]
  return isAppRoute(candidate) ? candidate : null
}

export function createHistoryState(route: AppRoute): HistoryRouteState {
  return { [HISTORY_STATE_KEY]: route }
}

export function routeDepth(route: AppRoute): number {
  if (route.type === 'home') return 0
  if (route.type === 'expertise') return 1
  return 2
}

export function getInitialRoute(): AppRoute {
  if (typeof window === 'undefined') return { type: 'home' }
  return pathToRoute(window.location.pathname) ?? getStoredRoute()
}

export function syncBrowserHistory(route: AppRoute, mode: 'push' | 'replace'): void {
  if (typeof window === 'undefined') return

  const path = routeToPath(route)
  const state = createHistoryState(route)

  if (mode === 'replace') {
    window.history.replaceState(state, '', path)
    return
  }

  window.history.pushState(state, '', path)
}

function parseRoute(raw: string | null): AppRoute {
  if (!raw) return { type: 'home' }

  try {
    const parsed = JSON.parse(raw) as AppRoute
    if (parsed?.type === 'home') return { type: 'home' }
    if (parsed?.type === 'expertise' && isExpertiseCategory(parsed.category)) {
      return { type: 'expertise', category: parsed.category }
    }
    if (parsed?.type === 'project' && typeof parsed.projectId === 'string') {
      return { type: 'project', projectId: parsed.projectId }
    }
  } catch {
    // fall through to legacy string storage
  }

  if (isExpertiseCategory(raw)) {
    return { type: 'expertise', category: raw }
  }

  return { type: 'home' }
}

export function getStoredRoute(): AppRoute {
  if (typeof window === 'undefined') return { type: 'home' }

  const stored = sessionStorage.getItem(ROUTE_KEY)
  if (stored) return parseRoute(stored)

  return parseRoute(sessionStorage.getItem(LEGACY_PAGE_KEY))
}

export function storeRoute(route: AppRoute): void {
  sessionStorage.setItem(ROUTE_KEY, JSON.stringify(route))

  if (route.type === 'home') {
    sessionStorage.removeItem(LEGACY_PAGE_KEY)
    return
  }

  if (route.type === 'expertise') {
    sessionStorage.setItem(LEGACY_PAGE_KEY, route.category)
    return
  }

  sessionStorage.removeItem(LEGACY_PAGE_KEY)
}

/** @deprecated Use getStoredRoute */
export function getStoredActivePage(): ActivePage {
  const route = getStoredRoute()
  if (route.type === 'expertise') return route.category
  return 'home'
}

/** @deprecated Use storeRoute */
export function storeActivePage(page: ActivePage): void {
  if (page === 'home') {
    storeRoute({ type: 'home' })
    return
  }
  storeRoute({ type: 'expertise', category: page })
}
