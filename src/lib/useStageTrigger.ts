import { useEffect, type RefObject } from 'react'

/**
 * Phones: instead of tying animations to every scroll frame (which iPhones can't keep in step
 * with the finger, so they tremble), a section flips `data-stage="in"` once, and its CSS
 * *transitions* play on the GPU on their own: perfectly smooth whatever the scroll is doing.
 *
 * The stage turns on when the section's top rises above `line` (a fraction of the window height
 * from the top) and back off only when the section drops below it again (scrolling back up), so it
 * never flickers. No React re-render: the attribute is set directly.
 */
export function useStageTrigger(ref: RefObject<HTMLElement | null>, enabled: boolean, line = 0.75) {
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.dataset.stage = 'in'
        else if (entry.boundingClientRect.top > 0) delete el.dataset.stage
      },
      { rootMargin: `0px 0px ${-(1 - line) * 100}% 0px` },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      delete el.dataset.stage
    }
  }, [ref, enabled, line])
}
