import type { SpotifyConfig } from './types'

export const PLAYLIST_LABEL = "Mirvé's playlist"

/** Mirvé's public Spotify playlist — always used for the embed API. */
export const SPOTIFY_PLAYLIST_ID = '6iaorTAQejaa8wA6RT81Wg'

const DEFAULT_SPOTIFY_EMBED_URL = `https://open.spotify.com/embed/playlist/${SPOTIFY_PLAYLIST_ID}?utm_source=generator&theme=0`
const DEFAULT_SPOTIFY_WEB_URL = `https://open.spotify.com/playlist/${SPOTIFY_PLAYLIST_ID}`

function readEnv(value: string | undefined): string {
  return value?.trim() ?? ''
}

function parsePlaylistId(embedUrl: string, webUrl: string): string | null {
  const match =
    embedUrl.match(/playlist\/([a-zA-Z0-9]+)/) ??
    webUrl.match(/playlist\/([a-zA-Z0-9]+)/)

  return match?.[1] ?? null
}

function resolveSpotifyConfig(): SpotifyConfig {
  const embedFromEnv = readEnv(import.meta.env.VITE_SPOTIFY_EMBED_URL)
  const webFromEnv = readEnv(import.meta.env.VITE_SPOTIFY_WEB_URL)
  const envPlaylistId = parsePlaylistId(embedFromEnv, webFromEnv)

  if (envPlaylistId) {
    return {
      embedUrl: embedFromEnv || DEFAULT_SPOTIFY_EMBED_URL,
      webUrl: webFromEnv || DEFAULT_SPOTIFY_WEB_URL,
    }
  }

  return {
    embedUrl: DEFAULT_SPOTIFY_EMBED_URL,
    webUrl: DEFAULT_SPOTIFY_WEB_URL,
  }
}

/** Spotify embed + web URLs — env overrides only when they contain a valid playlist id. */
export const SPOTIFY: SpotifyConfig = resolveSpotifyConfig()

/** Spotify URI for iFrame API */
export const SPOTIFY_PLAYLIST_URI = `spotify:playlist:${SPOTIFY_PLAYLIST_ID}`

/** Open playlist in Spotify app / web for full-track playback (mobile). */
export function openSpotifyPlaylist(): boolean {
  if (!SPOTIFY.webUrl) return false
  window.open(SPOTIFY.webUrl, '_blank', 'noopener,noreferrer')
  return true
}
