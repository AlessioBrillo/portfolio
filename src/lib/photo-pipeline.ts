/**
 * Pure, testable helpers for the photo pipeline (`scripts/optimize-images.mjs`).
 *
 * The script is plain JavaScript and this module is TypeScript: Node >=22.18
 * imports it through native type stripping (same pattern as
 * `scripts/generate-sitemap.mjs` importing `src/lib/sitemap.ts`).
 *
 * The helpers implement the derivative naming convention — every file carries a
 * short content hash so replacing a raw photo changes every URL and the set is
 * cache-safe forever (ADR-0016). No Node built-ins here: the script computes
 * the hash and hands it in, so this module stays platform-neutral and fully
 * unit-testable.
 */

/** Length of the hex content hash embedded in every derivative name. */
export const HASH_LENGTH = 8;

const HASH_PATTERN = new RegExp(`^(.+?)-(\\d+)-([0-9a-f]{${HASH_LENGTH}})\\.(avif|webp|jpg)$`);
/** Legacy names from the pre-ADR-0016 pipeline: `{subject}-{width}.{ext}`. */
const LEGACY_PATTERN = /^(.+?)-(\d+)\.(avif|webp|jpg)$/;

/**
 * Filesystem-safe, ASCII, hyphenated subject from a raw filename — extension
 * included or not ("VDS volo 01.jpg" -> "vds-volo-01", as does
 * "Who Portrait 4x5.png" -> "who-portrait-4x5"). Collision detection passes
 * full filenames, so the extension must be dropped here, not by the caller.
 */
export function slugify(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** The configured widths that actually downscale the source (never upscale, never duplicate). */
export function effectiveWidths(
  originalWidth: number,
  widths: readonly number[],
): readonly number[] {
  return [...new Set(widths)].filter((width) => width < originalWidth);
}

/** Content-hashed derivative name: `{subject}-{width}-{hash}.{ext}` (ADR-0016). */
export function derivativeName(
  subject: string,
  width: number,
  hash: string,
  extension: string,
): string {
  return `${subject}-${width}-${hash}.${extension}`;
}

/**
 * Raw filenames whose slugified subjects collide — the pipeline would
 * silently overwrite one derivative set with another.
 */
export function findSlugCollisions(
  fileNames: readonly string[],
): ReadonlyArray<{ readonly subject: string; readonly count: number }> {
  const counts = new Map<string, number>();
  for (const name of fileNames) {
    const subject = slugify(name);
    counts.set(subject, (counts.get(subject) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count > 1)
    .map(([subject, count]) => ({ subject, count }));
}

/**
 * Derivative files (current hashed scheme or the legacy unhashed one) that
 * this run did not produce — candidates for `--prune`. Non-derivative files
 * (README, hand-placed images without a `-{width}` suffix) are never touched.
 */
export function filesToPrune(
  existingFiles: readonly string[],
  producedFiles: ReadonlySet<string>,
): readonly string[] {
  return existingFiles.filter(
    (file) => (HASH_PATTERN.test(file) || LEGACY_PATTERN.test(file)) && !producedFiles.has(file),
  );
}
