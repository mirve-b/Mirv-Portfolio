/** The pages of the art journal, built from the art folders. Each leaf of the book has two faces. */

export type JournalFace =
  | { kind: 'cover' }
  | { kind: 'title' }
  | { kind: 'art'; src: string; series: string; subtitle: string; index: number }
  | { kind: 'notes' }
  | { kind: 'end' }
  | { kind: 'back' }

const art = import.meta.glob<string>('../../assets/ART/*/*.webp', { eager: true, import: 'default' })

/** Order and captions, matching the art projects on the portfolio. */
const SERIES: { folder: string; title: string; subtitle: string }[] = [
  { folder: 'After hours', title: 'After Hours', subtitle: 'Portraits' },
  { folder: 'Second Skin', title: 'Second Skin', subtitle: 'Character concepts' },
  { folder: 'SOMEWHERE ELSE', title: 'Somewhere Else', subtitle: 'Narrative illustrations' },
  { folder: 'Archive', title: 'Archive', subtitle: 'Illustrations' },
  { folder: 'TOY BOX', title: 'Toy Box', subtitle: 'Mirvé Kids' },
  { folder: 'StoryShelf', title: 'Story Shelf', subtitle: "Children's book illustrations" },
]

function artFaces(): JournalFace[] {
  const faces: JournalFace[] = []
  for (const series of SERIES) {
    const files = Object.entries(art)
      .filter(([path]) => path.includes(`/ART/${series.folder}/`))
      .map(([path, src]) => ({ name: path.split('/').pop() ?? '', src }))
      .filter(({ name }) => /^\d+\.webp$/i.test(name))
      .sort((a, b) => parseInt(a.name, 10) - parseInt(b.name, 10))
    files.forEach((file, i) =>
      faces.push({ kind: 'art', src: file.src, series: series.title, subtitle: series.subtitle, index: i + 1 }),
    )
  }
  return faces
}

/** cover, title page, the art, then an end page and the back cover — padded so every leaf has two faces. */
export function buildJournal(): JournalFace[] {
  const faces: JournalFace[] = [{ kind: 'cover' }, { kind: 'title' }, ...artFaces()]
  // the back cover must land on the back of the last leaf, so the face count has to be even
  if ((faces.length + 2) % 2 !== 0) faces.push({ kind: 'notes' })
  faces.push({ kind: 'end' }, { kind: 'back' })
  return faces
}
