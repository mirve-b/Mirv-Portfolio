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

    preloadSpotifyIframeApi()

    const tryMount = () => {
      if (!hostRef.current || controllerRef.current) return false
      const api = window.Spotify?.IframeApi
      if (!api) return false
      mountController(api)
      return true
    }

    const onApiReady = (api: SpotifyIframeApi) => {
      mountController(api)
    }

    const previousReady = window.onSpotifyIframeApiReady
    window.onSpotifyIframeApiReady = (api) => {
      previousReady?.(api)
      onApiReady(api)
    }

    if (tryMount()) {
      return () => {
        window.onSpotifyIframeApiReady = previousReady
      }
    }

    let attempt = 0
    let retryTimer = 0

    const scheduleRetry = () => {
      const delay = Math.min(80 * 2 ** attempt, 640)
      attempt += 1
      retryTimer = window.setTimeout(() => {
        if (tryMount()) return
        if (attempt < 12) scheduleRetry()
      }, delay)
    }

    scheduleRetry()

    return () => {
      window.clearTimeout(retryTimer)
      window.onSpotifyIframeApiReady = previousReady
    }
  }, [hostRef, mountController, playlistUri, enabled])

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
