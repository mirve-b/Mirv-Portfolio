/**
 * Batch-convert PNG/JPEG assets under src/assets to WebP.
 *
 * Usage:
 *   npm run assets:webp              # convert, keep originals
 *   npm run assets:webp -- --replace # convert and delete originals
 *   npm run assets:webp -- --dry-run # preview only
 *
 * After --replace, run with --update-imports (or use assets:webp:all).
 */

import { readdir, readFile, stat, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const assetsDir = path.join(root, 'src/assets')
const srcDir = path.join(root, 'src')

const IMAGE_EXT = /\.(png|jpe?g)$/i
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git'])

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const replace = args.has('--replace')
const updateImports = args.has('--update-imports')

function maxWidthFor(filePath) {
  const base = path.basename(filePath).toLowerCase()
  if (base.includes('thumbnail')) return 960
  if (filePath.includes(`${path.sep}Collage${path.sep}`)) return 1400
  if (filePath.includes(`${path.sep}Notes${path.sep}`)) return 800
  if (filePath.includes(`${path.sep}DEV${path.sep}`)) return 1800
  return 2200
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue
      files.push(...(await walk(full)))
      continue
    }
    if (IMAGE_EXT.test(entry.name) && !entry.name.endsWith('.webp')) {
      files.push(full)
    }
  }

  return files
}

async function convertFile(filePath) {
  const outPath = filePath.replace(IMAGE_EXT, '.webp')
  if (outPath === filePath) return null

  const inputStat = await sharp(filePath).metadata()
  const maxWidth = maxWidthFor(filePath)
  const pipeline = sharp(filePath).rotate().resize({
    width: inputStat.width && inputStat.width > maxWidth ? maxWidth : undefined,
    withoutEnlargement: true,
  })

  const beforeStat = await stat(filePath)
  const beforeSize = beforeStat.size

  if (dryRun) {
    return { filePath, outPath, before: beforeSize, after: 0, dryRun: true }
  }

  const buffer = await pipeline.webp({ quality: 82, effort: 4 }).toBuffer()
  await writeFile(outPath, buffer)

  if (replace) {
    await unlink(filePath)
  }

  return { filePath, outPath, before: beforeSize, after: buffer.length, replaced: replace }
}

async function updateSourceImports() {
  const extensions = ['.ts', '.tsx']
  let fileCount = 0
  let replaceCount = 0

  async function walkSrc(dir) {
    const entries = await readdir(dir, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        await walkSrc(full)
        continue
      }
      if (!extensions.some((ext) => entry.name.endsWith(ext))) continue

      const text = await readFile(full, 'utf8')
      const next = text.replace(
        /(\.(png|PNG|jpe?g|JPEG))(['"])/g,
        '.webp$3',
      )
      if (next !== text) {
        fileCount += 1
        replaceCount += (text.match(/(\.(png|PNG|jpe?g|JPEG))(['"])/g) ?? []).length
        if (!dryRun) await writeFile(full, next)
      }
    }
  }

  await walkSrc(srcDir)
  return { fileCount, replaceCount }
}

async function main() {
  console.log('MIRVÉ asset converter → WebP\n')
  if (dryRun) console.log('(dry run — no files written)\n')

  const files = await walk(assetsDir)
  console.log(`Found ${files.length} PNG/JPEG files under src/assets\n`)

  let totalBefore = 0
  let totalAfter = 0

  for (const file of files) {
    const result = await convertFile(file)
    if (!result) continue

    if (result.dryRun) {
      totalBefore += result.before
      console.log(`  would convert ${path.relative(root, file)} (${(result.before / 1024 / 1024).toFixed(2)} MB)`)
      continue
    }

    totalBefore += result.before
    totalAfter += result.after
    const pct = result.before ? Math.round((1 - result.after / result.before) * 100) : 0
    console.log(
      `  ✓ ${path.relative(root, result.outPath)}  ${(result.before / 1024 / 1024).toFixed(2)} MB → ${(result.after / 1024 / 1024).toFixed(2)} MB (−${pct}%)`,
    )
  }

  if (!dryRun && totalBefore > 0) {
    const saved = totalBefore - totalAfter
    console.log(
      `\nImages: ${(totalBefore / 1024 / 1024).toFixed(1)} MB → ${(totalAfter / 1024 / 1024).toFixed(1)} MB (saved ${(saved / 1024 / 1024).toFixed(1)} MB)`,
    )
  }

  if (updateImports) {
    const { fileCount, replaceCount } = await updateSourceImports()
    console.log(`\nImports: updated ${replaceCount} paths in ${fileCount} source files`)
  } else if (replace && !dryRun) {
    console.log('\nNext: npm run assets:webp:imports  (rewrites .png imports → .webp in src/)')
  }

  console.log('\nVideos (hero.mov, KAEL.mp4, etc.) are not converted — compress separately with HandBrake or:')
  console.log('  ffmpeg -i input.mp4 -vcodec libx264 -crf 28 -preset slow -an output.mp4')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
