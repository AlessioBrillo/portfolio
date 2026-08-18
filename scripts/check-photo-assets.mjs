#!/usr/bin/env node
/**
 * The photo-asset contract gate (companion to ADR-0016). Walks
 * `public/photos/`, collects every URL the content modules reference through
 * `ImageAsset` blocks, and enforces both directions:
 *
 *   - every referenced URL resolves to a committed file — a paste typo would
 *     otherwise 404 silently in production, made permanent by the immutable
 *     cache headers;
 *   - every committed derivative is referenced by a content module — dead
 *     weight in the repository and the deployment.
 *
 * The pure logic lives in `src/lib/photo-assets.ts` (unit-tested); this file
 * is the thin CLI wrapper, following the same split as
 * `scripts/check-deploy-routing.mjs` / `src/lib/deploy-routing.ts`. The asset
 * aggregation comes from `src/content/assets.ts` — the single source of truth
 * for every photo slot the site renders.
 *
 * Usage:
 *   npm run photos:check
 *
 * Exit codes: 0 contract holds, 1 violation, 2 cannot check (missing
 * directory or sources) — "cannot check" is never reported as "contract
 * holds". With no photos committed and no `src` set, the contract holds
 * trivially; it starts to mean something the day the first photo lands.
 */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllImageAssets } from '../src/content/assets.ts';
import {
  collectReferencedPhotoPaths,
  findMissingPhotoFiles,
  findOrphanPhotoDerivatives,
} from '../src/lib/photo-assets.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PHOTOS_DIR = join(ROOT, 'public', 'photos');

/** Every committed file under `public/photos/`, as posix paths relative to `public/`. */
function listPhotoFiles(dir, prefix = 'photos') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = `${prefix}/${entry.name}`;
    return entry.isDirectory() ? listPhotoFiles(join(dir, entry.name), rel) : [rel];
  });
}

if (!existsSync(PHOTOS_DIR)) {
  console.error('[photos] public/photos/ missing — cannot check the asset contract.');
  process.exit(2);
}

const committed = listPhotoFiles(PHOTOS_DIR);
const referenced = collectReferencedPhotoPaths(getAllImageAssets());
const missing = findMissingPhotoFiles(referenced, committed);
const orphans = findOrphanPhotoDerivatives(committed, referenced);

let violations = 0;
if (missing.length > 0) {
  violations += 1;
  console.error(
    '[photos] VIOLATION: content modules reference photo files that do not exist in public/photos/:',
  );
  for (const url of missing) {
    console.error(`  ${url}`);
  }
  console.error('[photos] Re-run the optimizer for the raw source, or fix the pasted block.');
}
if (orphans.length > 0) {
  violations += 1;
  console.error('[photos] VIOLATION: committed derivatives that no content module references:');
  for (const path of orphans) {
    console.error(`  ${path}`);
  }
  console.error('[photos] Remove them from the repo, or reference them in a content module.');
}

if (violations > 0) {
  process.exit(1);
}
console.log(
  `[photos] asset contract holds (${referenced.length} referenced, ${committed.length} committed).`,
);
