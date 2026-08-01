import { useEffect, useRef } from 'react'
import { subscribeSpotifyPlaybackStart } from './spotifyPlayback'

/** Mutes competing video audio when the Spotify embed starts playing. */
export function useMuteVideoOnSpotifyPlay(
  isAudible: boolean,
  onMute: () => void,
  enabled: boolean,
): void {
  const audibleRef = useRef(isAudible)
  audibleRef.current = isAudible

  const onMuteRef = useRef(onMute)
  onMuteRef.current = onMute

  useEffect(() => {
    if (!enabled) return

    return subscribeSpotifyPlaybackStart(() => {
      if (!audibleRef.current) return
      onMuteRef.current()
    })
  }, [enabled])
}
