import { lazy, Suspense } from 'react'
import App from './App.tsx'

// a separate test page: the art journal lives at /journal and doesn't touch the main site
const JournalPage = lazy(() => import('./components/Journal').then((m) => ({ default: m.JournalPage })))

export function Root() {
  const isJournal = window.location.pathname.replace(/\/+$/, '') === '/journal'
  if (!isJournal) return <App />
  return (
    <Suspense fallback={null}>
      <JournalPage />
    </Suspense>
  )
}
