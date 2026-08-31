#!/usr/bin/env node
/**
 * The bundle-size gate (ADR-0018). Reads the committed baselines and the real
 * files in `dist/`, then enforces the budgets for both gzip and brotli:
 *
 *   - entry chunk  — the module script `index.html` references (the chunk a
 *                    visitor's first interaction waits on);
 *   - total JS     — every chunk summed (entry + lazy routes + lazy vendor).
 *
 * The gate fails only when BOTH gzip AND brotli exceed their respective
 * budgets. A regression in one algorithm but not the other is not a failure.
 *
 * Usage:
 *   npm run bundle:check                      gate mode — exit 1 when over budget
 *   npm run bundle:check -- --fail-on-increase  gate mode — also fail if any
 *                                     individual chunk exceeds baseline total
 *   npm run bundle:check -- --ci                CI mode — alias for --fail-on-increase
 *   npm run bundle:check -- --update-baseline --origin "<reason>"
 *                                     update baselines with per-chunk data; requires
 *                                     a meaningful --origin note (ADR-0018)
 *   npm run bundle:report                     report mode — prints the per-chunk
 *                                     breakdown and never fails (local review)
 *
 * Requires a production build first (`npm run build`); `dist/` is
 * git-ignored, so CI always builds before this step.
 *
 * Exit codes: 0 within budget, 1 over budget, 2 build/baseline missing.
 *
 * The gate logic itself lives in `src/lib/bundle-budget.ts` (unit-tested);
 * this file is the thin CLI wrapper, following the same split as
 * `scripts/optimize-images.mjs` / `src/lib/photo-pipeline.ts`.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkBundle,
  computeCompressed,
  listJsChunks,
  readEntryScript,
} from '../src/lib/bundle-budget.ts';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST_DIR = join(ROOT, 'dist');
const INDEX_HTML = join(DIST_DIR, 'index.html');
const GZIP_BASELINE_PATH = join(ROOT, 'bundle-baseline-gzip.json');
const BROTLI_BASELINE_PATH = join(ROOT, 'bundle-baseline-brotli.json');
const REPORT_ONLY = process.argv.includes('--report');
const FAIL_ON_INCREASE =
  process.argv.includes('--fail-on-increase') || process.argv.includes('--ci');
const UPDATE_BASELINE = process.argv.includes('--update-baseline');
const ORIGIN_INDEX = process.argv.indexOf('--origin');
const ORIGIN_NOTE = ORIGIN_INDEX !== -1 ? process.argv[ORIGIN_INDEX + 1] : '';

const toKb = (bytes) => bytes / 1024;

if (
  !existsSync(INDEX_HTML) ||
  !existsSync(GZIP_BASELINE_PATH) ||
  !existsSync(BROTLI_BASELINE_PATH)
) {
  console.error(
    '[bundle] Run `npm run build` first (dist/ is git-ignored), and keep both bundle-baseline-gzip.json and bundle-baseline-brotli.json committed.',
  );
  process.exit(2);
}

const html = await readFile(INDEX_HTML, 'utf8');
const entryFile = readEntryScript(html);
const chunks = await listJsChunks(DIST_DIR);
const compressed = computeCompressed(chunks);

const gzipBaseline = JSON.parse(readFileSync(GZIP_BASELINE_PATH, 'utf8'));
const brotliBaseline = JSON.parse(readFileSync(BROTLI_BASELINE_PATH, 'utf8'));

// Merge baselines into the combined format expected by checkBundle
const baseline = {
  entryChunkKb: {
    gzip: gzipBaseline.entryChunkKb,
    brotli: brotliBaseline.entryChunkKb,
  },
  totalJsKb: {
    gzip: gzipBaseline.totalJsKb,
    brotli: brotliBaseline.totalJsKb,
  },
  chunks: gzipBaseline.chunks?.map((gzipChunk, i) => ({
    name: gzipChunk.name,
    gzipKb: gzipChunk.gzipKb,
    brotliKb: brotliBaseline.chunks?.[i]?.brotliKb ?? gzipChunk.gzipKb, // fallback to gzip if brotli missing
  })),
};

const result = checkBundle(compressed, entryFile, baseline, FAIL_ON_INCREASE);

console.log('[bundle] JS payload (gzip):');
for (const chunk of compressed) {
  const marker = result.entry && chunk.name === result.entry.file ? ' (entry)' : '';
  console.log(
    `  ${chunk.name.padEnd(44)} ${toKb(chunk.gzipBytes).toFixed(2).padStart(9)} kB${marker}`,
  );
}
console.log(
  `  ${'total'.padEnd(44)} ${result.total.gzipKb.toFixed(2).padStart(9)} kB (budget ${result.total.budgetKb.gzip} kB)`,
);

console.log('[bundle] JS payload (brotli):');
for (const chunk of compressed) {
  const marker = result.entry && chunk.name === result.entry.file ? ' (entry)' : '';
  console.log(
    `  ${chunk.name.padEnd(44)} ${toKb(chunk.brotliBytes).toFixed(2).padStart(9)} kB${marker}`,
  );
}
console.log(
  `  ${'total'.padEnd(44)} ${result.total.brotliKb.toFixed(2).padStart(9)} kB (budget ${result.total.budgetKb.brotli} kB)`,
);

if (result.violations.length > 0) {
  for (const violation of result.violations) {
    console.error(`[bundle] VIOLATION: ${violation}`);
  }
  if (REPORT_ONLY) {
    console.warn('[bundle] over budget — see docs/adr/0018-bundle-size-budget.md');
    process.exit(0);
  }
  console.error('[bundle] over budget — see docs/adr/0018-bundle-size-budget.md');
  process.exit(1);
}
console.log('[bundle] within budget');

if (UPDATE_BASELINE) {
  if (!ORIGIN_NOTE) {
    console.error('[bundle] --update-baseline requires --origin "<reason>" (see ADR-0018)');
    process.exit(2);
  }
  if (ORIGIN_NOTE.length < 10) {
    console.error('[bundle] --origin note too short; provide a meaningful reason (min 10 chars)');
    process.exit(2);
  }
  const date = new Date().toISOString().split('T')[0];

  // Update gzip baseline
  const gzipChunkBaselines = compressed.map((chunk) => ({
    name: chunk.name,
    gzipKb: Math.round(toKb(chunk.gzipBytes) * 10) / 10,
  }));
  const updatedGzipBaseline = {
    ...gzipBaseline,
    entryChunkKb: gzipBaseline.entryChunkKb,
    totalJsKb: gzipBaseline.totalJsKb,
    chunks: gzipChunkBaselines,
    origin: `${gzipBaseline.origin} | Updated ${date}: ${ORIGIN_NOTE}`,
  };
  writeFileSync(GZIP_BASELINE_PATH, JSON.stringify(updatedGzipBaseline, null, 2) + '\n');

  // Update brotli baseline
  const brotliChunkBaselines = compressed.map((chunk) => ({
    name: chunk.name,
    brotliKb: Math.round(toKb(chunk.brotliBytes) * 10) / 10,
  }));
  const updatedBrotliBaseline = {
    ...brotliBaseline,
    entryChunkKb: brotliBaseline.entryChunkKb,
    totalJsKb: brotliBaseline.totalJsKb,
    chunks: brotliChunkBaselines,
    origin: `${brotliBaseline.origin} | Updated ${date}: ${ORIGIN_NOTE}`,
  };
  writeFileSync(BROTLI_BASELINE_PATH, JSON.stringify(updatedBrotliBaseline, null, 2) + '\n');

  console.log('[bundle] both baselines updated with per-chunk data');
}
