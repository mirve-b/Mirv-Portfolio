const INTRO_KEY = 'mirve-intro-complete'
const ENTRY_PFP_KEY = 'mirve-entry-pfp-seen'

export function hasSeenIntro(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(INTRO_KEY) === '1'
}

export function markIntroSeen(): void {
  sessionStorage.setItem(INTRO_KEY, '1')
}

export function hasSeenEntryPfp(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(ENTRY_PFP_KEY) === '1'
}

export function markEntryPfpSeen(): void {
  sessionStorage.setItem(ENTRY_PFP_KEY, '1')
}
