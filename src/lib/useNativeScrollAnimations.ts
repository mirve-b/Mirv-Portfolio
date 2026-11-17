import { useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

/**
 * True when the browser can run scroll-linked animations natively (CSS scroll timelines:
 * Chrome/Android, Safari 26+). Sections then do their scroll effects in CSS, which the browser
 * runs alongside the scroll itself with no JavaScript per frame (smooth on phones), and
 * framer-motion stays out of it. Elsewhere the same effects run through framer-motion.
 * Always false with reduced motion (those effects rest at their final state instead).
 */
export function useNativeScrollAnimations(): boolean {
  const reduced = useReducedMotion()
  const [supported] = useState(
    () => typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()'),
  )
  return supported && !reduced
}
