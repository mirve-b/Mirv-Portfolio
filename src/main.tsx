import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { preloadSpotifyIframeApi } from './components/NowPlaying/spotifyPreload'
import './styles/globals.css'
import App from './App.tsx'

preloadSpotifyIframeApi()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
