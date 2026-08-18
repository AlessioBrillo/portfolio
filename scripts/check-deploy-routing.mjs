#!/usr/bin/env node
/**
 * The deploy-routing gate. Reads `vercel.json` and the committed static
 * inventory of `public/`, then enforces the SPA-fallback contract (ADR-0005):
 * no request for a real static file may be rewritten to `/index.html` — a
 * rewritten photo would be served as HTML bytes and break every `<img>`.
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

/** Every committed static file, as posix-style paths relative to `public/`. */
function listPublicFiles(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    return entry.isDirectory() ? listPublicFiles(join(dir, entry.name), rel) : [rel];
  });
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

const staticFiles = listPublicFiles(PUBLIC_DIR);
const violations = staticFiles.filter((file) => isSpaFallbackRewrite(`/${file}`, source));

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