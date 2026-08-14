#!/usr/bin/env node
/**
 * Optimizes raw photos into the site's responsive image set.
 *
 * Usage:
 *   npm run images -- --src <raw-dir> [--out public/photos] [--widths 480,960,1600] [--sizes "<hint>"]
 *
 * For every raster image in <raw-dir> (git-ignored — sources stay private) it
 * writes AVIF + WebP at each configured width plus a JPEG fallback at the
 * largest width, then prints the exact `ImageAsset` block to paste into the
 * content modules (`src`, `sources`, `sizes`, `width`, `height`). The browser
 * reserves the true ratio (zero CLS, ADR-0009) and picks the best supported
 * format via the `<picture>` sources (see `ImageBlock`).
 *
 * The script never touches `src/content`: the author reviews and pastes the
 * printed block, so alt text and captions stay human-written.
 */
import { existsSync } from 'node:fs';
import { mkdir, readdir } from 'node:fs/promises';
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

if (!SOURCE_DIR || !existsSync(SOURCE_DIR)) {
  console.error('[images] Missing --src <dir> with the raw photos. See docs/content/photos.md.');
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

/** Filesystem-safe, ASCII, hyphenated base name (e.g. "VDS volo 01.jpg" -> "vds-volo-01"). */
function slugify(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The widths that actually downscale the source (never upscale, never duplicate). */
function effectiveWidths(originalWidth) {
  return [...new Set(WIDTHS)].filter((width) => width < originalWidth);
}

async function optimizeImage(fileName) {
  const input = path.join(SOURCE_DIR, fileName);
  const name = slugify(path.parse(fileName).name);
  const pipeline = sharp(input);
  const { width: originalWidth, height: originalHeight } = await pipeline.metadata();

  if (!originalWidth || !originalHeight) {
    console.warn(`[images] Skipping ${fileName}: no readable dimensions.`);
    return;
  }

  const widths = effectiveWidths(originalWidth);
  const largest = widths.length > 0 ? widths[widths.length - 1] : originalWidth;
  const largestHeight = Math.round((originalHeight / originalWidth) * largest);

  await mkdir(OUT_DIR, { recursive: true });

  const srcSet = (extension) =>
    widths.map((width) => `/photos/${name}-${width}.${extension} ${width}w`).join(', ');

  for (const width of widths) {
    const resized = pipeline.clone().resize({ width, withoutEnlargement: true }).rotate();
    await resized
      .avif({ quality: 55, effort: 4 })
      .toFile(path.join(OUT_DIR, `${name}-${width}.avif`));
    await resized.webp({ quality: 78 }).toFile(path.join(OUT_DIR, `${name}-${width}.webp`));
  }
  if (widths.length === 0) {
    await pipeline
      .clone()
      .rotate()
      .avif({ quality: 55, effort: 4 })
      .toFile(path.join(OUT_DIR, `${name}-${originalWidth}.avif`));
    await pipeline
      .clone()
      .rotate()
      .webp({ quality: 78 })
      .toFile(path.join(OUT_DIR, `${name}-${originalWidth}.webp`));
  }
  await pipeline
    .clone()
    .resize({ width: largest, withoutEnlargement: true })
    .rotate()
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT_DIR, `${name}-${largest}.jpg`));

  console.log(
    `\n[images] ${name}  (${largest}x${largestHeight}, fallback /photos/${name}-${largest}.jpg)`,
  );
  console.log(`  src:      '/photos/${name}-${largest}.jpg',`);
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

console.log(`[images] ${files.length} source(s) -> ${OUT_DIR} at widths ${WIDTHS.join(', ')}.`);
for (const file of files) {
  try {
    await optimizeImage(file);
  } catch (error) {
    console.warn(`[images] Failed on ${file}: ${error?.message ?? error}`);
  }
}
console.log(
  '\n[images] Done. Paste the printed blocks into the content modules (docs/content/photos.md).',
);
