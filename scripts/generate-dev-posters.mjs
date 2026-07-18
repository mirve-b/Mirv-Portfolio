/**
 * Extract lightweight WebP posters from DEV showcase MP4s.
 * Usage: node scripts/generate-dev-posters.mjs
 */

import { execFile } from 'node:child_process'
import { mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import ffmpegPath from 'ffmpeg-static'
import sharp from 'sharp'

const execFileAsync = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const devDir = path.join(__dirname, '../src/assets/DEV')
const postersDir = path.join(devDir, 'posters')

function posterName(videoFile) {
  return `${path.basename(videoFile, path.extname(videoFile))}.webp`
}

async function extractPoster(videoPath, outputPath) {
  const tmpPng = `${outputPath}.tmp.png`

  await execFileAsync(ffmpegPath, [
    '-hide_banner',
    '-loglevel',
    'error',
    '-ss',
    '0.35',
    '-i',
    videoPath,
    '-frames:v',
    '1',
    '-vf',
    'scale=960:-2',
    '-y',
    tmpPng,
  ])

  await sharp(tmpPng)
    .webp({ quality: 78, effort: 4 })
    .toFile(outputPath)

  const { unlink } = await import('node:fs/promises')
  await unlink(tmpPng)
}

async function main() {
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not available')
  }

  await mkdir(postersDir, { recursive: true })

  const videos = (await readdir(devDir)).filter((file) => /\.mp4$/i.test(file))

  for (const video of videos) {
    const input = path.join(devDir, video)
    const output = path.join(postersDir, posterName(video))
    process.stdout.write(`Poster: ${video} → posters/${posterName(video)}\n`)
    await extractPoster(input, output)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
