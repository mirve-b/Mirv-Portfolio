export type ToolboxToolId =
  | 'figma'
  | 'procreate'
  | 'ibisPaint'
  | 'vscode'
  | 'cursor'
  | 'illustrator'

export type ToolboxTool = {
  id: ToolboxToolId
  label: string
}

export const EXPERTISE_HEADINGS = [
  'Product Engineering',
  'Product Design',
  'Illustration',
] as const

export const TOOLBOX: ToolboxTool[] = [
  { id: 'figma', label: 'Figma' },
  { id: 'procreate', label: 'Procreate' },
  { id: 'ibisPaint', label: 'Ibis Paint X' },
  { id: 'vscode', label: 'VS Code' },
  { id: 'cursor', label: 'Cursor' },
  { id: 'illustrator', label: 'Adobe Illustrator' },
]
