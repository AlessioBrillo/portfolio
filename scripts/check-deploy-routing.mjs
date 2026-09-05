#!/usr/bin/env node
/**
 * The deploy-routing gate. Reads `vercel.json` and the committed static
 * inventory of `public/`, then enforces the SPA-fallback contract (ADR-0005):
 * no request for a real static file may be rewritten to `/index.html` — a
 * rewritten photo would be served as HTML bytes and break every `<img>`.
 *
 * Also enforces the Plausible proxy contract (ADR-0020):
 * - `middleware.ts` must exist at project root for conditional proxy
 * - `vercel.json` must NOT contain Plausible rewrites (handled by middleware)
 *
 * And the sitemap contract: `dist/sitemap.xml` (emitted only when
 * `VITE_SITE_URL` is set) must exist then, and must never match the fallback.
 *
 * The exclusion list lives in `vercel.json` as the fallback rewrite's regex
 * `source`; this gate walks `public/` and fails when any committed file is
 * not excluded. The pure logic lives in `src/lib/deploy-routing.ts`
 * (unit-tested); this file is the thin CLI wrapper, following the same split
 * as `scripts/check-bundle.mjs` / `src/lib/bundle-budget.ts`.
 *
 * Usage:
 *   npm run deploy:check
 *
 * Exit codes: 0 contract holds, 1 violation, 2 cannot check (missing config
 * or sources) — "cannot check" is never reported as "contract holds".
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSpaFallbackSource, isSpaFallbackRewrite } from '../src/lib/deploy-routing.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VERCEL_JSON = join(ROOT, 'vercel.json');
const PUBLIC_DIR = join(ROOT, 'public');
const MIDDLEWARE_TS = join(ROOT, 'middleware.ts');

/** Every committed static file, as posix-style paths relative to `public/`. */
function listPublicFiles(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listPublicFiles(join(dir, entry.name), rel) : [rel];
  });
}

/** Check that middleware.ts exists for Plausible conditional proxy (ADR-0020). */
function checkMiddleware() {
  if (!existsSync(MIDDLEWARE_TS)) {
    console.error('[deploy] VIOLATION: middleware.ts missing at project root.');
    console.error('[deploy] Required for conditional Plausible proxy (ADR-0020).');
    process.exit(1);
  }
  console.log('[deploy] middleware.ts present for conditional Plausible proxy.');
}

/** Check that vercel.json has no Plausible rewrites (they belong in middleware). */
function checkNoPlausibleRewrites(config) {
  const rewrites = config.rewrites ?? [];
  const plausiblePaths = ['/js/script.js', '/api/event'];
  for (const rewrite of rewrites) {
    const source = rewrite.source ?? '';
    for (const path of plausiblePaths) {
      // Check if the rewrite source would match the Plausible paths
      if (source.includes(path.replace('/', '\\/')) || source === path) {
        console.error(`[deploy] VIOLATION: vercel.json contains Plausible rewrite for ${path}.`);
        console.error(
          '[deploy] Plausible rewrites must be in middleware.ts, not vercel.json (ADR-0020).',
        );
        process.exit(1);
      }
    }
  }
  console.log('[deploy] vercel.json has no Plausible rewrites (handled by middleware).');
}

if (!existsSync(VERCEL_JSON)) {
  console.error('[deploy] vercel.json missing — cannot check the SPA-fallback routing.');
  process.exit(2);
}

const config = JSON.parse(readFileSync(VERCEL_JSON, 'utf8'));
const source = getSpaFallbackSource(config);
if (!source) {
  console.error('[deploy] No SPA-fallback rewrite targeting /index.html in vercel.json.');
  process.exit(2);
}

// Check middleware and Plausible rewrite separation (ADR-0020)
checkMiddleware();
checkNoPlausibleRewrites(config);

const staticFiles = listPublicFiles(PUBLIC_DIR);
const violations = staticFiles.filter((file) => isSpaFallbackRewrite(`/${file}`, source));

// The Plausible proxy paths are owned by middleware.ts: they must never fall
// through to index.html (HTML bytes served as JavaScript). With the env pair
// unset the middleware answers 404 directly.
const proxyPaths = ['/js/script.js', '/api/event'];
for (const proxyPath of proxyPaths) {
  if (isSpaFallbackRewrite(proxyPath, source)) {
    console.error(
      `[deploy] VIOLATION: ${proxyPath} would be served as index.html by the SPA fallback.`,
    );
    console.error('[deploy] Exclude the Plausible proxy paths in vercel.json (ADR-0020).');
    process.exit(1);
  }
}
console.log('[deploy] Plausible proxy paths excluded from the SPA fallback.');

// The build-time sitemap lives in dist/ (not public/), so the public/ walk
// above cannot see it — check it explicitly. A missing sitemap fails only
// when a domain is configured (pre-domain there is nothing to advertise);
// a sitemap served as index.html HTML bytes is always a violation.
const DIST_SITEMAP = join(ROOT, 'dist', 'sitemap.xml');
const siteUrl = process.env.VITE_SITE_URL ?? '';
if (siteUrl && !existsSync(DIST_SITEMAP)) {
  console.error('[deploy] VIOLATION: VITE_SITE_URL is set but dist/sitemap.xml was not emitted.');
  console.error('[deploy] The sitemap step must fail closed — check generate-sitemap output.');
  process.exit(1);
}
if (existsSync(DIST_SITEMAP) && isSpaFallbackRewrite('/sitemap.xml', source)) {
  console.error(
    '[deploy] VIOLATION: /sitemap.xml would be served as index.html by the SPA fallback.',
  );
  console.error('[deploy] Add an exclusion to the fallback rewrite source in vercel.json.');
  process.exit(1);
}
if (existsSync(DIST_SITEMAP)) {
  console.log('[deploy] sitemap.xml excluded from the SPA fallback.');
}

if (violations.length > 0) {
  console.error(
    '[deploy] VIOLATION: these public/ files would be served as index.html by the SPA fallback:',
  );
  for (const violation of violations) {
    console.error(`  /${violation}`);
  }
  console.error('[deploy] Add an exclusion to the fallback rewrite source in vercel.json.');
  process.exit(1);
}
console.log(`[deploy] SPA-fallback routing contract holds (${staticFiles.length} static files).`);
console.log('[deploy] All deploy-routing checks passed.');
