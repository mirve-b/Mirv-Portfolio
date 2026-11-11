import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

/** True when the visitor asked the OS for reduced motion. */
export function useReducedMotion(): boolean {
  return Boolean(useFramerReducedMotion())
}
