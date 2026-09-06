#!/usr/bin/env node
/**
 * The deploy smoke gate. Runs the checks in `src/lib/smoke.ts` against a real
 * Vercel deployment (preview or production) — the only place where the Edge
 * middleware, the security headers, and the domain-mode artifacts exist
 * together. CI cannot cover that combination; the runbook invokes this
 * instead of hand-reading the Network tab.
 *
 * Usage:
 *   npm run smoke -- --url <preview-or-prod-url> [--apex <apex-host>]
 *
 * The pure checks live in `src/lib/smoke.ts` (unit-tested); this file is the
 * thin CLI wrapper, following the same split as `scripts/check-bundle.mjs`.
 *
 * Exit codes: 0 all checks pass (skips allowed), 1 a check failed,
 * 2 cannot check (missing URL, malformed URL, network error) — "cannot
 * check" is never reported as "deploy holds".
 */
import { hasSmokeFailures, runSmokeChecks } from '../src/lib/smoke.ts';

function usage() {
  console.error('Usage: npm run smoke -- --url <base-url> [--apex <apex-host>]');
}

const args = process.argv.slice(2);
const urlIndex = args.indexOf('--url');
const apexIndex = args.indexOf('--apex');
const baseUrl = urlIndex === -1 ? undefined : args[urlIndex + 1];
const apexHost = apexIndex === -1 ? undefined : args[apexIndex + 1];

if (!baseUrl || baseUrl.startsWith('--') || (apexIndex !== -1 && !apexHost)) {
  usage();
  process.exit(2);
}

let results;
try {
  const request = (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) });
  results = await runSmokeChecks(baseUrl, request, { apexHost });
} catch (error) {
  console.error(`[smoke] cannot check ${baseUrl}: ${error?.message ?? error}`);
  process.exit(2);
}

for (const result of results) {
  console.log(`[smoke] [${result.status}] ${result.name} — ${result.detail}`);
}
const failed = results.filter((result) => result.status === 'fail').length;
const skipped = results.filter((result) => result.status === 'skip').length;
console.log(
  `[smoke] ${results.length - failed - skipped} passed, ${failed} failed, ${skipped} skipped.`,
);
process.exit(hasSmokeFailures(results) ? 1 : 0);
