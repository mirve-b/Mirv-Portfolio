const INTRO_KEY = 'mirve-intro-complete'

export function hasSeenIntro(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(INTRO_KEY) === '1'
}

export function markIntroSeen(): void {
  sessionStorage.setItem(INTRO_KEY, '1')
}
