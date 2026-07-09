/** Update these with your real links & email */
export const CONTACT_EMAIL = 'hello@mirve.studio'

/**
 * Get a free access key at https://web3forms.com
 * Add to `.env`: VITE_WEB3FORMS_ACCESS_KEY=your_key
 * Submissions are forwarded to the email you register there.
 */
export const WEB3FORMS_ACCESS_KEY =
  import.meta.env.VITE_WEB3FORMS_ACCESS_KEY ?? ''

export const SOCIAL_LINKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/m._.blvck/',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mirve-b',
  },
  {
    id: 'behance',
    label: 'Behance',
    href: 'https://www.behance.net/mirve',
  },
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/mirve-b',
  },
  {
    id: 'fiverr',
    label: 'Fiverr',
    href: 'https://www.fiverr.com/',
  },
] as const
