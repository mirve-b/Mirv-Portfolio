import { useState } from 'react'

/**
 * True on phones and tablets only, i.e. touch-screen devices with no mouse: the film sections
 * then play just their one main film (the side strips are plain dark panels) and the hero is
 * still, since decoding three videos at once is what makes a phone stutter.
 *
 * Desktops and laptops never get this, whatever the window size, core count or memory: they keep
 * the full design (the zoom and the three-part strip). Decided once on load.
 */
export function useLiteMedia(): boolean {
  const [lite] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none) and (pointer: coarse)').matches,
  )
  return lite
}
