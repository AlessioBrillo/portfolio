#!/usr/bin/env node
/**
 * Optimizes raw photos into the site's responsive image set.
 *
 * Usage:
 *   npm run images -- --src <raw-dir> [--out public/photos] [--widths 480,960,1600] [--sizes "<hint>"] [--prune]
 *
 * For every raster image in <raw-dir> (git-ignored — sources stay private) it
 * writes AVIF + WebP at each configured width plus a JPEG fallback at the
 * largest width, then prints the exact `ImageAsset` block to paste into the
 * content modules (`src`, `sources`, `sizes`, `width`, `height`). The browser
 * reserves the true ratio (zero CLS, ADR-0009) and picks the best supported
 * format via the `<picture>` sources (see `ImageBlock`).
 *
 * Naming: every derivative embeds an 8-hex hash of the source bytes
 * (`{subject}-{width}-{hash}.{ext}`, ADR-0016). Replacing a raw photo changes
 * every URL, so the set is cache-safe forever under the immutable headers
 * Vercel serves for `/photos/*`. Re-running on unchanged raws is idempotent
 * (same names, overwritten bytes). `--prune` additionally deletes derivative
 * files in `--out` that this run did not produce, including legacy unhashed
 * names from the pre-hash pipeline.
 *
 * The script never touches `src/content`: the author reviews and pastes the
 * printed block, so alt text and captions stay human-written.
 *
 * Requires Node >=22.18 (native TypeScript type stripping) to import the
 * helper module `src/lib/photo-pipeline.ts` (see `engines` in package.json).
 */
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readdir, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);

function argValue(name) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

const SOURCE_DIR = argValue('--src');
const OUT_DIR = argValue('--out') ?? 'public/photos';
const WIDTHS = (argValue('--widths') ?? '480,960,1600')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((width) => Number.isInteger(width) && width > 0);
const SIZES_HINT = argValue('--sizes') ?? '(min-width: 1024px) 40vw, 100vw';
const PRUNE = args.includes('--prune');

let helpers;
try {
  ({
    slugify,
    effectiveWidths,
    derivativeName,
    findSlugCollisions,
    filesToPrune,
    HASH_LENGTH,
  } = await import('../src/lib/photo-pipeline.ts'));
} catch (error) {
  console.error(
    '[images] Could not load src/lib/photo-pipeline.ts — requires Node >=22.18 (native TypeScript type stripping).',
  );
  console.error(error?.message ?? error);
  process.exit(1);
}

if (!SOURCE_DIR || !existsSync(SOURCE_DIR)) {
  console.error('[images] Missing --src <dir> with the raw photos. See docs/content/photos.md.');
  process.exit(1);
}
if (path.resolve(SOURCE_DIR) === path.resolve(OUT_DIR)) {
  console.error('[images] --out must differ from --src: derivatives never overwrite the raws.');
  process.exit(1);
}

const RAW_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.tif',
  '.tiff',
  '.heic',
]);

/** sha-256 of the source bytes, trimmed to the naming hash (ADR-0016). */
async function contentHash(inputPath) {
  const bytes = await readFile(inputPath);
  return createHash('sha256').update(bytes).digest('hex').slice(0, HASH_LENGTH);
}

/** The widths that actually downscale the source (never upscale, never duplicate). */
function effectiveWidthsOf(originalWidth) {
  return effectiveWidths(originalWidth, WIDTHS);
}

async function optimizeImage(fileName, produced) {
  const input = path.join(SOURCE_DIR, fileName);
  const subject = slugify(path.parse(fileName).name);
  const hash = await contentHash(input);
  const pipeline = sharp(input);
  const { width: originalWidth, height: originalHeight } = await pipeline.metadata();

  if (!originalWidth || !originalHeight) {
    console.warn(`[images] Skipping ${fileName}: no readable dimensions.`);
    return;
  }

  const widths = effectiveWidthsOf(originalWidth);
  const largest = widths.length > 0 ? widths[widths.length - 1] : originalWidth;
  const largestHeight = Math.round((originalHeight / originalWidth) * largest);

  await mkdir(OUT_DIR, { recursive: true });

  const name = (width, extension) => derivativeName(subject, width, hash, extension);

  const srcSet = (extension) =>
    widths.map((width) => `/photos/${name(width, extension)} ${width}w`).join(', ');

  for (const width of widths) {
    const resized = pipeline.clone().resize({ width, withoutEnlargement: true }).rotate();
    const avifFile = name(width, 'avif');
    const webpFile = name(width, 'webp');
    await resized.avif({ quality: 55, effort: 4 }).toFile(path.join(OUT_DIR, avifFile));
    await resized.webp({ quality: 78 }).toFile(path.join(OUT_DIR, webpFile));
    produced.push(avifFile, webpFile);
  }
  if (widths.length === 0) {
    const avifFile = name(originalWidth, 'avif');
    const webpFile = name(originalWidth, 'webp');
    await pipeline
      .clone()
      .rotate()
      .avif({ quality: 55, effort: 4 })
      .toFile(path.join(OUT_DIR, avifFile));
    await pipeline
      .clone()
      .rotate()
      .webp({ quality: 78 })
      .toFile(path.join(OUT_DIR, webpFile));
    produced.push(avifFile, webpFile);
  }
  const jpegFile = name(largest, 'jpg');
  await pipeline
    .clone()
    .resize({ width: largest, withoutEnlargement: true })
    .rotate()
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_DIR, jpegFile));
  produced.push(jpegFile);

  console.log(`\n[images] ${subject}  (${largest}x${largestHeight}, hash ${hash})`);
  console.log(`  src:      '/photos/${jpegFile}',`);
  console.log(`  width:    ${largest},`);
  console.log(`  height:   ${largestHeight},`);
  console.log(`  sizes:    '${SIZES_HINT}',`);
  if (widths.length > 0) {
    console.log(`  sources:  [`);
    console.log(`    { type: 'image/avif', srcSet: '${srcSet('avif')}' },`);
    console.log(`    { type: 'image/webp', srcSet: '${srcSet('webp')}' },`);
    console.log(`  ],`);
  }
}

const files = (await readdir(SOURCE_DIR)).filter((file) =>
  RAW_EXTENSIONS.has(path.extname(file).toLowerCase()),
);
if (files.length === 0) {
  console.error(
    `[images] No raster images found in ${SOURCE_DIR} (${[...RAW_EXTENSIONS].join(', ')}).`,
  );
  process.exit(1);
}

const collisions = findSlugCollisions(files);
if (collisions.length > 0) {
  console.error('[images] Raw filenames collide after slugging — the derivatives would overwrite each other:');
  for (const { subject, count } of collisions) {
    console.error(`  ${subject} (${count} files)`);
  }
  console.error('Rename the raws so each subject is unique, then re-run.');
  process.exit(1);
}

console.log(`[images] ${files.length} source(s) -> ${OUT_DIR} at widths ${WIDTHS.join(', ')}.`);
const produced = [];
for (const file of files) {
  try {
    await optimizeImage(file, produced);
  } catch (error) {
    console.warn(`[images] Failed on ${file}: ${error?.message ?? error}`);
  }
}

if (PRUNE) {
  const existing = await readdir(OUT_DIR);
  const toRemove = filesToPrune(existing, new Set(produced));
  for (const file of toRemove) {
    await rm(path.join(OUT_DIR, file));
    console.log(`[images] pruned ${file}`);
  }
  if (toRemove.length > 0) console.log(`[images] Pruned ${toRemove.length} stale derivative(s).`);
}

console.log(
  '\n[images] Done. Paste the printed blocks into the content modules (docs/content/photos.md).',
);
