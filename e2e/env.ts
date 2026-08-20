/**
 * The deploy-time env pair that the pre-domain contract assertions must agree
 * with. `canonicalStudyUrl` (src/lib/site.ts) and `initAnalytics`
 * (src/lib/analytics.ts) decide at build time from `import.meta.env`, which
 * Vite inlines from the same process env that feeds the dev server and the
 * preview build — so the assertions keyed off `process.env` here stay
 * self-consistent with the build under test, pre-domain or not.
 */
export const hasCanonicalOrigin = Boolean(process.env.VITE_SITE_URL);

export const hasAnalytics = Boolean(
  process.env.VITE_PLAUSIBLE_SRC && process.env.VITE_PLAUSIBLE_DOMAIN,
);
