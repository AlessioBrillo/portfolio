/**
 * Pure, testable helpers for the photo-asset contract — the guarantee that
 * every URL a content module references through an `ImageAsset` block exists
 * as a committed derivative in `public/photos/` (companion to ADR-0016).
 *
 * The naming convention made the pipeline cache-safe, but the paste workflow
 * still had a hole: content modules paste machine-printed blocks, and no test
 * verified the URLs actually resolve. These helpers close both directions —
 * missing referenced files (a silent 404 in production, made permanent by the
 * immutable cache headers) and committed orphans (dead weight nobody serves)
 * — and are enforced by `npm run photos:check`
 * (`scripts/check-photo-assets.mjs`) and by the live-repo contract tests.
 *
 * No Node built-ins here: callers walk the filesystem and hand in plain
 * arrays, so this module stays platform-neutral and fully unit-testable
 * (the same pure-logic split as `deploy-routing.ts` / `bundle-budget.ts`).
 */

import type { ImageAsset } from '@/types/domain';

/** The route the pipeline owns and serves with immutable caching (ADR-0016). */
const PHOTO_ROUTE = '/photos/';

/** The committed photo directory, as posix paths relative to `public/`. */
const PHOTO_PREFIX = 'photos/';

/** The committed non-derivative file that is never an orphan. */
const PHOTOS_README = 'photos/README.md';

/**
 * The URLs inside a srcSet string ("/photos/x.avif 480w, /photos/y.avif 960w"
 * -> ["/photos/x.avif", "/photos/y.avif"]). Entries without a URL are
 * skipped; URL comparison is exact, so a `?v=` query is a real mismatch.
 */
function srcSetUrls(srcSet: string): readonly string[] {
  return srcSet
    .split(',')
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter((url): url is string => Boolean(url));
}

/**
 * Every URL the assets reference, deduplicated and in first-reference order.
 * Only `/photos/`-prefixed URLs are collected — future external origins (the
 * CSP already admits `img-src https:`) are outside the pipeline's guarantee.
 */
export function collectReferencedPhotoPaths(assets: readonly ImageAsset[]): readonly string[] {
  const urls: string[] = [];
  for (const asset of assets) {
    if (asset.src?.startsWith(PHOTO_ROUTE)) urls.push(asset.src);
    for (const source of asset.sources ?? []) {
      urls.push(...srcSetUrls(source.srcSet).filter((url) => url.startsWith(PHOTO_ROUTE)));
    }
    if (asset.srcSet) {
      urls.push(...srcSetUrls(asset.srcSet).filter((url) => url.startsWith(PHOTO_ROUTE)));
    }
  }
  return [...new Set(urls)];
}

/**
 * Referenced URLs that do not resolve to a committed file — each one would
 * 404 on every client, forever (immutable cache headers cannot help a path
 * that never existed). Returned in the pasted form, so the author sees
 * exactly what the content module says.
 */
export function findMissingPhotoFiles(
  referencedPhotoUrls: readonly string[],
  committedPhotoPaths: readonly string[],
): readonly string[] {
  const committed = new Set(committedPhotoPaths);
  return referencedPhotoUrls.filter((url) => !committed.has(url.replace(/^\//, '')));
}

/**
 * Committed derivatives that no content module references — dead weight in
 * the repository and the deployment. The README is never an orphan; files
 * outside `photos/` are not the pipeline's inventory.
 */
export function findOrphanPhotoDerivatives(
  committedPhotoPaths: readonly string[],
  referencedPhotoUrls: readonly string[],
): readonly string[] {
  const referenced = new Set(referencedPhotoUrls.map((url) => url.replace(/^\//, '')));
  return committedPhotoPaths.filter(
    (path) => path.startsWith(PHOTO_PREFIX) && path !== PHOTOS_README && !referenced.has(path),
  );
}
