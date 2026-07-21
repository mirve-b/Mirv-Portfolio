/** Update these with your real links & email */
export const CONTACT_EMAIL = 'blvckmirve@gmail.com'

function readEnv(value: string | undefined): string {
  return value?.trim() ?? ''
}

/**
 * Web3Forms access key — set VITE_WEB3FORMS_ACCESS_KEY in .env / Vercel.
 * Restrict the key to mirve.dev in the Web3Forms dashboard.
 */
export const WEB3FORMS_ACCESS_KEY = readEnv(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY)

export const SOCIAL_LINKS = [
  {
    id: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/m._.blvck/',
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/mirveb',
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
] as const
