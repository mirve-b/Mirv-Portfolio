/** Update these with your real links & email */
export const CONTACT_EMAIL = 'blvckmirve@gmail.com'

/**
 * Web3Forms access key — client-side by design (see web3forms.com).
 * Override with VITE_WEB3FORMS_ACCESS_KEY in .env / Vercel if you rotate the key.
 */
const DEFAULT_WEB3FORMS_ACCESS_KEY = 'c49acc0c-6934-4722-800e-28ba6be771cc'

function readEnv(value: string | undefined): string {
  return value?.trim() ?? ''
}

export const WEB3FORMS_ACCESS_KEY =
  readEnv(import.meta.env.VITE_WEB3FORMS_ACCESS_KEY) || DEFAULT_WEB3FORMS_ACCESS_KEY

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
