import type { SpotifyConfig } from './types'

export const PLAYLIST_LABEL = "Mirvé's playlist"

function readEnv(value: string | undefined): string {
  return value?.trim() ?? ''
}

/** Spotify embed iframe src — set VITE_SPOTIFY_EMBED_URL in .env */
export const SPOTIFY: SpotifyConfig = {
  embedUrl: readEnv(import.meta.env.VITE_SPOTIFY_EMBED_URL),
  webUrl: readEnv(import.meta.env.VITE_SPOTIFY_WEB_URL),
}

function parsePlaylistUri(embedUrl: string, webUrl: string): string {
  const match =
    embedUrl.match(/playlist\/([a-zA-Z0-9]+)/) ??
    webUrl.match(/playlist\/([a-zA-Z0-9]+)/)

  return match ? `spotify:playlist:${match[1]}` : ''
}

/** Spotify URI for iFrame API — derived from env URLs */
export const SPOTIFY_PLAYLIST_URI = parsePlaylistUri(
  SPOTIFY.embedUrl,
  SPOTIFY.webUrl,
)

/** Open playlist in Spotify app / web for full-track playback (mobile). */
export function openSpotifyPlaylist(): boolean {
  if (!SPOTIFY.webUrl) return false
  window.open(SPOTIFY.webUrl, '_blank', 'noopener,noreferrer')
  return true
}
