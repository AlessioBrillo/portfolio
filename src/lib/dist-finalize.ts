/**
 * Pure helpers for the postbuild dist finalizer (domain landing, Phase 6).
 *
 * While `VITE_SITE_URL` is unset (pre-domain) `dist/` stays exactly as Vite
 * emitted it — relative `og:image`, no JSON-LD `url`, no `Sitemap:` line —
 * so previews and forks never advertise a throwaway origin. Once the domain
 * lands, `scripts/finalize-dist.mjs` applies these helpers to `dist/` only:
 * `index.html` and `public/robots.txt` sources stay domain-agnostic.
 */
export function stripTrailingSlash(origin: string): string {
  return origin.replace(/\/+$/, '');
}

/**
 * Rewrites a relative `og:image` to its absolute production URL. Leaves an
 * already-absolute `og:image` (or a missing one) untouched — idempotent.
 */
export function absolutizeOgImage(html: string, origin: string): string {
  const base = stripTrailingSlash(origin);
  return html.replace(
    /(<meta\s+property="og:image"\s+content=")(\/[^"]*)(")/,
    (_, open: string, path: string, close: string) => `${open}${base}${path}${close}`,
  );
}

/**
 * Injects the canonical `url` into the Person JSON-LD block. No-op when the
 * block is absent or already carries a `url` — idempotent.
 */
export function injectJsonLdUrl(html: string, origin: string): string {
  if (/"url"\s*:/.test(html)) return html;
  const base = stripTrailingSlash(origin);
  return html.replace(/("name":\s*"[^"]+",)/, `$1\n        "url": "${base}/",`);
}

/**
 * Replaces the `<domain>` placeholder comment in `robots.txt` with a real
 * `Sitemap:` line. No-op when no placeholder is present — idempotent.
 */
export function finalizeRobotsTxt(robots: string, origin: string): string {
  const base = stripTrailingSlash(origin);
  if (!robots.includes('https://<domain>/sitemap.xml')) return robots;
  return robots.replace(
    /# Sitemap: https:\/\/<domain>\/sitemap\.xml[^\n]*/,
    `Sitemap: ${base}/sitemap.xml`,
  );
}
