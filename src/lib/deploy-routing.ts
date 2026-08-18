/**
 * The deploy routing contract (ADR-0005, `vercel.json`): every unmatched
 * request is rewritten to `/index.html` unless the path belongs to a real
 * static file. The exclusion list lives in `vercel.json` as the regex
 * `source` of the fallback rewrite; these helpers parse it and answer
 * "would this path be rewritten?", so the routing stays pinned by unit
 * tests and by `npm run deploy:check` (`scripts/check-deploy-routing.mjs`)
 * — the same pure-logic-plus-thin-CLI split as `bundle-budget.ts` /
 * `check-bundle.mjs`.
 *
 * Vercel matches `source` against the entire request path (leading slash
 * included), so a full-match regex is the correct semantics.
 */

/** Narrows an unknown value to a plain record, for the parsed vercel.json
 * shape. Arrays are deliberately not records: `rewrites` is a list, not a
 * single entry. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The regex `source` of the SPA-fallback rewrite — the rewrite whose
 * destination is `/index.html`. Undefined when the config has no fallback
 * (a config without it would serve static 404s instead of the single page).
 */
export function getSpaFallbackSource(config: unknown): string | undefined {
  if (!isRecord(config)) return undefined;
  const rewrites = config.rewrites;
  if (!Array.isArray(rewrites)) return undefined;
  const fallback = rewrites.find((entry) => isRecord(entry) && entry.destination === '/index.html');
  return isRecord(fallback) && typeof fallback.source === 'string' ? fallback.source : undefined;
}

/** True when the request path would be rewritten by the SPA fallback —
 * false means the static file wins and is served as itself. */
export function isSpaFallbackRewrite(path: string, source: string): boolean {
  return new RegExp(`^(?:${source})$`).test(path);
}
