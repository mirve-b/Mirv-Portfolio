import type { NowPlayingTrack } from './types'
import trackSrc from '../../assets/Tell Me We\'re Okay.mp3'

/**
 * To use a different song:
 * 1. Add the .mp3 file to src/assets/
 * 2. Import it above and set title + artist below
 *
 * Note: Spotify links cannot play inside a custom player.
 * You need an audio file you own the rights to host.
 */
export const DEFAULT_TRACK: NowPlayingTrack = {
  title: 'Blood Pours',
  artist: 'MIRVÉ',
  audioSrc: trackSrc,
}
