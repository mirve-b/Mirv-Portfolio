import {
  getProjectMetaById,
  isProjectOpenable,
  PORTFOLIO_PROJECTS,
} from '../data/portfolioProjects'

/** Expertise categories shown on the Expertise page tab bar. */
export type ExpertiseCategory = 'art' | 'ui-ux' | 'development'

export type AppRoute =
  | { type: 'home' }
  | { type: 'expertise'; category: ExpertiseCategory }
  | { type: 'project'; projectId: string }

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

const PROJECT_PATH_CATEGORY_PREFIXES: ExpertiseCategory[] = [
  'ui-ux',
  'development',
  'art',
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

const HISTORY_STATE_KEY = 'mirveRoute'

export type HistoryRouteState = {
  [HISTORY_STATE_KEY]: AppRoute
}

function isExpertiseCategory(value: string): value is ExpertiseCategory {
  return (EXPERTISE_TAB_ORDER as readonly string[]).includes(value)
}

function isAppRoute(value: unknown): value is AppRoute {
  if (!value || typeof value !== 'object') return false

  const route = value as AppRoute
  if (route.type === 'home') return true
  if (route.type === 'expertise') return isExpertiseCategory(route.category)
  if (route.type === 'project') return typeof route.projectId === 'string' && route.projectId.length > 0
  return false
}

function compactProjectSlug(projectId: string): string {
  return projectId.replace(/-/g, '')
}

function projectPathSegment(category: ExpertiseCategory, projectId: string): string {
  return `${category}-${compactProjectSlug(projectId)}`
}

function projectRouteFromExpertiseSegment(segment: string): AppRoute | null {
  for (const category of PROJECT_PATH_CATEGORY_PREFIXES) {
    const prefix = `${category}-`
    if (!segment.startsWith(prefix)) continue

    const compactSlug = segment.slice(prefix.length)
    if (!compactSlug) continue

    for (const project of PORTFOLIO_PROJECTS) {
      if (project.category !== category) continue
      if (!isProjectOpenable(project)) continue
      if (compactProjectSlug(project.id) === compactSlug) {
        return { type: 'project', projectId: project.id }
      }
    }
  }

  return null
}

function projectRouteFromLegacySlug(slug: string): AppRoute | null {
  const meta = getProjectMetaById(slug)
  if (!meta || !isProjectOpenable(meta)) return null
  return { type: 'project', projectId: slug }
}

export function routeToPath(route: AppRoute): string {
  if (route.type === 'home') return '/'
  if (route.type === 'expertise') return '/expertise'

  const meta = getProjectMetaById(route.projectId)
  if (!meta || !isProjectOpenable(meta)) return '/expertise'

  return `/expertise/${projectPathSegment(meta.category, route.projectId)}`
}

export function pathToRoute(pathname: string): AppRoute | null {
  const path = pathname.replace(/\/+$/, '') || '/'

  if (path === '/') return { type: 'home' }

  if (path === '/expertise') {
    return { type: 'expertise', category: 'art' }
  }

  const expertiseSubMatch = path.match(/^\/expertise\/([^/]+)$/)
  if (expertiseSubMatch) {
    const segment = decodeURIComponent(expertiseSubMatch[1])

    const projectRoute = projectRouteFromExpertiseSegment(segment)
    if (projectRoute) return projectRoute

    if (isExpertiseCategory(segment)) {
      return { type: 'expertise', category: segment }
    }

    return null
  }

  const legacyProjectMatch = path.match(/^\/project\/([^/]+)$/)
  if (legacyProjectMatch) {
    return projectRouteFromLegacySlug(decodeURIComponent(legacyProjectMatch[1]))
  }

  const rootMatch = path.match(/^\/([^/]+)$/)
  if (rootMatch && rootMatch[1] !== 'expertise') {
    return projectRouteFromLegacySlug(decodeURIComponent(rootMatch[1]))
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

  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  const fromPath = pathToRoute(window.location.pathname)

  if (fromPath) {
    if (fromPath.type === 'expertise' && path === '/expertise') {
      const stored = getStoredRoute()
      if (stored.type === 'expertise') {
        return { type: 'expertise', category: stored.category }
      }
    }

    return fromPath
  }

  return getStoredRoute()
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
