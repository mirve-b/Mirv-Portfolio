import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'
import type { SpotifyEmbedController, SpotifyIframeApi } from '../spotifyIframeApi.types'
import { preloadSpotifyIframeApi } from '../spotifyPreload'

const EMBED_HEIGHT = '352'

export function useSpotifyController(
  hostRef: RefObject<HTMLDivElement | null>,
  playlistUri: string,
  enabled: boolean,
) {
  const controllerRef = useRef<SpotifyEmbedController | null>(null)
  const [ready, setReady] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

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

          controller.addListener('playback_update', (payload) => {
            const data = payload.data as { isPaused?: boolean }
            if (typeof data.isPaused === 'boolean') {
              setIsPlaying(!data.isPaused)
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

    const retry = window.setInterval(() => {
      if (tryMount()) window.clearInterval(retry)
    }, 50)

    return () => {
      window.clearInterval(retry)
      window.onSpotifyIframeApiReady = previousReady
    }
  }, [hostRef, mountController, playlistUri, enabled])

  return { ready, isPlaying }
}
