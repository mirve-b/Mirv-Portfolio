import { useEffect, useState } from 'react'

/**
 * Touch-screen devices (no mouse) in their phone layout: phones, and tablets held upright (iPad
 * portrait, up to 834px wide), plus phones turned sideways (short screens). The film sections
 * then play lighter and stay still, since iPhones and iPads can't keep scroll-linked motion in
 * step with the finger.
 *
 * Desktops and laptops never get this, whatever the window size. An iPad in landscape gets the
 * full desktop design. It follows the device as it's rotated.
 */
const LITE_MQ =
  '(hover: none) and (pointer: coarse) and (max-width: 834px), (hover: none) and (pointer: coarse) and (max-height: 500px)'

export function useLiteMedia(): boolean {
  const [lite, setLite] = useState(() => typeof window !== 'undefined' && window.matchMedia(LITE_MQ).matches)

  useEffect(() => {
    const media = window.matchMedia(LITE_MQ)
    const sync = () => setLite(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return lite
}
