import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import { SMOOTH_PAUSE_MS } from '../../../lib/spotifyPlayback'
import type { SpotifyEmbedController, SpotifyIframeApi } from '../spotifyIframeApi.types'
import { preloadSpotifyIframeApi } from '../spotifyPreload'

const EMBED_HEIGHT = '152'

type PlaybackState = {
  isPaused?: boolean
}

function readIsPlaying(payload: { data: unknown }): boolean | undefined {
  const data = payload.data
  if (!data || typeof data !== 'object') return undefined

  const record = data as Record<string, unknown>
  if (typeof record.isPaused === 'boolean') {
    return !record.isPaused
  }

  const nested = record.payload
  if (nested && typeof nested === 'object') {
    const nestedRecord = nested as PlaybackState
    if (typeof nestedRecord.isPaused === 'boolean') {
      return !nestedRecord.isPaused
    }
  }

  return undefined
}

/**
 * The iFrame API builds the embed without a theme, which gives the coloured player. Switch the
 * embed to Spotify's gray theme (theme=0), the same as the embed code from Spotify's generator.
 */
function applyGrayTheme(playlistUri: string) {
  const id = playlistUri.split(':').pop()
  if (!id) return
  const iframe = document.querySelector<HTMLIFrameElement>(`iframe[src*="${id}"]`)
  if (!iframe) return
  const url = new URL(iframe.src)
  if (url.searchParams.get('theme') === '0') return
  url.searchParams.set('theme', '0')
  iframe.src = url.toString()
}

export function useSpotifyController(
  hostRef: RefObject<HTMLDivElement | null>,
  playlistUri: string,
  enabled: boolean,
) {
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFading, setIsFading] = useState(false)

  const mountController = useCallback(
    (api: SpotifyIframeApi) => {
      const host = hostRef.current
      if (!host || controllerRef.current || !playlistUri) return

      api.createController(
        host,
        {
          uri: playlistUri,
          width: '100%',
          height: EMBED_HEIGHT,
        },
        (controller) => {
          controllerRef.current = controller
          applyGrayTheme(playlistUri)

          controller.addListener('ready', () => {
            setReady(true)
          })

          controller.addListener('playback_started', () => {
            setIsPlaying(true)
          })

          controller.addListener('playback_update', (payload) => {
            const playing = readIsPlaying(payload)
            if (typeof playing === 'boolean') {
              setIsPlaying(playing)
            }
          })
        },
      )
    },
    [hostRef, playlistUri],
  )

  useEffect(() => {
    if (!playlistUri || !enabled) return

    // the API is cached by spotifyPreload, so this resolves straight away if Spotify's script
    // has already loaded, or as soon as it does
    let cancelled = false
    void preloadSpotifyIframeApi().then((api) => {
      if (cancelled || !api) return
      mountController(api)
    })

    return () => {
      cancelled = true
    }
  }, [mountController, playlistUri, enabled])

  const pause = useCallback(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
    setIsFading(false)
    controllerRef.current?.pause()
    setIsPlaying(false)
  }, [])

  const smoothPause = useCallback(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current)
    }

    if (!controllerRef.current) return

    setIsFading(true)

    fadeTimerRef.current = window.setTimeout(() => {
      fadeTimerRef.current = null
      controllerRef.current?.pause()
      setIsPlaying(false)
      setIsFading(false)
    }, SMOOTH_PAUSE_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current)
      }
    }
  }, [])

  return { ready, isPlaying, isFading, pause, smoothPause }
}
