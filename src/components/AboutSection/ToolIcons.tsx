import type { ToolboxToolId } from './skillsData'

type IconProps = {
  className?: string
}

export function FigmaIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="13" y="3" width="8" height="8" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <rect x="3" y="13" width="8" height="8" rx="3" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="17" r="4" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function ProcreateIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 18c2-6 4-9 8-12 1 4-1 8-4 11-1.5 1.5-3 2.5-4 1z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19l2-2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IbisPaintIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 19l9-14 5 5-9 9H5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M13 5l6 6"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function VSCodeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 5l5.5 7L4 19l2 1 8-5.5L6 5 4 5zM14 8.5l6 3.5-6 3.5V8.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CursorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 4l12 6.5-5.5 1.5L9 19 5 4z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M14 14l4 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IllustratorIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9 16l2-6 2 6M10 13h2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 11v5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

const ICON_MAP = {
  figma: FigmaIcon,
  procreate: ProcreateIcon,
  ibisPaint: IbisPaintIcon,
  vscode: VSCodeIcon,
  cursor: CursorIcon,
  illustrator: IllustratorIcon,
} as const

export function ToolIcon({ id }: { id: ToolboxToolId }) {
  const Icon = ICON_MAP[id]
  return <Icon />
}
