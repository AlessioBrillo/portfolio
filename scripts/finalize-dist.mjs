#!/usr/bin/env node
/**
 * The dist finalizer (domain landing, Phase 6). Runs in `postbuild` after the
 * sitemap step: while `VITE_SITE_URL` is unset it is a no-op, so previews and
 * forks stay truthful (relative og:image, no JSON-LD url, no Sitemap: line).
 * Once the domain lands it rewrites only `dist/` — the committed sources
 * (`index.html`, `public/robots.txt`) stay domain-agnostic:
 *
 *   - `dist/index.html`: relative og:image -> absolute under the origin,
 *     canonical `url` injected into the Person JSON-LD block;
 *   - `dist/robots.txt`: `<domain>` placeholder -> real `Sitemap:` line.
 *
 * Fails closed when a domain is configured but `dist/` is missing; the pure
 * rewrites live in `src/lib/dist-finalize.ts` (unit-tested), this file is the
 * thin CLI wrapper, following the same split as `scripts/check-bundle.mjs`.
 *
 * Exit codes: 0 finalized or pre-domain no-op, 1 misconfigured, 2 dist missing.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { absolutizeOgImage, finalizeRobotsTxt, injectJsonLdUrl } from '../src/lib/dist-finalize.ts';
import { validateSiteUrl } from '../src/lib/validate-site-url.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_INDEX = join(ROOT, 'dist', 'index.html');
const DIST_ROBOTS = join(ROOT, 'dist', 'robots.txt');

const siteUrl = process.env.VITE_SITE_URL ?? '';

if (!siteUrl) {
  console.log('[finalize] VITE_SITE_URL unset — dist stays domain-agnostic (pre-domain).');
  process.exit(0);
}

const validation = validateSiteUrl(siteUrl);
if (!validation.valid) {
  console.error(`[finalize] INVALID VITE_SITE_URL: ${validation.error}`);
  process.exit(1);
}

if (!existsSync(DIST_INDEX)) {
  console.error('[finalize] dist/index.html missing — run `npm run build` first.');
  process.exit(2);
}

const html = readFileSync(DIST_INDEX, 'utf8');
const finalized = injectJsonLdUrl(absolutizeOgImage(html, siteUrl), siteUrl);
if (finalized !== html) {
  writeFileSync(DIST_INDEX, finalized, 'utf8');
  console.log('[finalize] dist/index.html now carries the absolute og:image + JSON-LD url.');
} else {
  console.log('[finalize] dist/index.html already final (idempotent no-op).');
}

if (existsSync(DIST_ROBOTS)) {
  const robots = readFileSync(DIST_ROBOTS, 'utf8');
  const finalizedRobots = finalizeRobotsTxt(robots, siteUrl);
  if (finalizedRobots !== robots) {
    writeFileSync(DIST_ROBOTS, finalizedRobots, 'utf8');
    console.log('[finalize] dist/robots.txt now advertises the sitemap.');
  }
} else {
  console.warn('[finalize] dist/robots.txt missing — skipping Sitemap line.');
}
