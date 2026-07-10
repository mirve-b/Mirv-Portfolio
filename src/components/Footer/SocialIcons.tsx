type IconProps = {
  className?: string
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M8 10v7M8 7.5v.01M12 17v-4.2c0-1.2.9-2.3 2.1-2.3s1.9 1 1.9 2.3V17M12 10v7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BehanceIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 7h6.2c2.2 0 3.8 1.1 3.8 3.2 0 1.3-.7 2.3-1.8 2.8 1.4.5 2.3 1.7 2.3 3.3 0 2.5-1.9 3.7-4.5 3.7H3V7zm3.2 4.8h2.7c1.1 0 1.7-.5 1.7-1.4 0-.9-.6-1.4-1.7-1.4H6.2v2.8zm0 5.2h3c1.2 0 1.9-.6 1.9-1.6 0-1-.7-1.6-1.9-1.6H6.2V17zM14.5 9h6M14.5 13.5h5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 19c-4 1.5-4-2.5-6-3m12 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 18 3.77 5.07 5.07 0 0 0 17.91 1S16.73.65 14 2.48a13.38 13.38 0 0 0-7 0C4.27.65 3.09 1 3.09 1A5.07 5.07 0 0 0 3 3.77 5.44 5.44 0 0 0 1.5 8.55c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 7 18.13V22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const ICON_MAP = {
  instagram: InstagramIcon,
  linkedin: LinkedInIcon,
  behance: BehanceIcon,
  github: GitHubIcon,
} as const

export function SocialIcon({ id }: { id: keyof typeof ICON_MAP }) {
  const Icon = ICON_MAP[id]
  return <Icon />
}
