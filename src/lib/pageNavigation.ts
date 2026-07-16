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

function isExpertiseCategory(value: string): value is ExpertiseCategory {
  return EXPERTISE_PAGES.includes(value as ExpertiseCategory)
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
