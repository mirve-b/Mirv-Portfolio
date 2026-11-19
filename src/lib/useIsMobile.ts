import { useEffect, useState } from 'react'

// phones, and tablets held upright (iPad portrait is 744–834px wide)
const MOBILE_MQ = '(max-width: 834px)'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  )

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MQ)
    const sync = () => setIsMobile(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])

  return isMobile
}
