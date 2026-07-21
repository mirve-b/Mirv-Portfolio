import type { SpotifyConfig } from './types'

export const PLAYLIST_LABEL = "Mirvé's playlist"

/** Mirvé's public Spotify playlist — used when env vars are unset. */
export const SPOTIFY_PLAYLIST_ID = '6iaorTAQejaa8wA6RT81Wg'

function readEnv(value: string | undefined): string {
  return value?.trim() ?? ''
}

function parsePlaylistId(embedUrl: string, webUrl: string): string | null {
  const match =
    embedUrl.match(/playlist\/([a-zA-Z0-9]+)/) ??
    webUrl.match(/playlist\/([a-zA-Z0-9]+)/)

  return match?.[1] ?? null
}

function resolveSpotifyConfig(): SpotifyConfig & { playlistId: string } {
  const embedFromEnv = readEnv(import.meta.env.VITE_SPOTIFY_EMBED_URL)
  const webFromEnv = readEnv(import.meta.env.VITE_SPOTIFY_WEB_URL)
  const envPlaylistId = parsePlaylistId(embedFromEnv, webFromEnv)
  const playlistId = envPlaylistId ?? SPOTIFY_PLAYLIST_ID

  return {
    playlistId,
    embedUrl:
      embedFromEnv ||
      `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`,
    webUrl: webFromEnv || `https://open.spotify.com/playlist/${playlistId}`,
  }
}

const spotifyConfig = resolveSpotifyConfig()

/** Spotify embed + web URLs — env overrides only when they contain a valid playlist id. */
export const SPOTIFY: SpotifyConfig = {
  embedUrl: spotifyConfig.embedUrl,
  webUrl: spotifyConfig.webUrl,
}

/** Spotify URI for iFrame API */
export const SPOTIFY_PLAYLIST_URI = `spotify:playlist:${spotifyConfig.playlistId}`
