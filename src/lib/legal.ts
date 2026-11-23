/**
 * Shared contract for the public legal surface: the canonical paths and the
 * date used both by the pages and by the build-time sitemap. Keeping this
 * module free of imports (and of `import.meta.env`) lets Node consume it
 * directly in `scripts/generate-sitemap.mjs` and `scripts/ci-domain.mjs`.
 */

/** Last meaningful change to the legal copy, used as the sitemap `lastmod`. */
export const LEGAL_UPDATED = '2026-11-23';

export interface LegalRoute {
  readonly path: '/privacy' | '/legal';
  readonly title: string;
  readonly description: string;
}

/** The two static legal routes, in the order they appear in the footer. */
export const LEGAL_ROUTES: readonly LegalRoute[] = [
  {
    path: '/privacy',
    title: 'Privacy',
    description: 'How this personal portfolio handles technical data and cookieless analytics.',
  },
  {
    path: '/legal',
    title: 'Legal',
    description: 'Identity, terms of use, content licensing, credits and font licences.',
  },
] as const;

/** The route record for a legal path; throws on an unknown path. */
export function legalRoute(path: LegalRoute['path']): LegalRoute {
  const route = LEGAL_ROUTES.find((candidate) => candidate.path === path);
  if (!route) throw new Error(`Unknown legal route: ${path}`);
  return route;
}

/**
 * The address used in the privacy notice for rights requests. Before the
 * domain lands the public mailbox stays the one already used by the site;
 * once a canonical origin is configured the dedicated `privacy@` alias on
 * that domain takes over automatically. The alias must exist before launch.
 */
export function privacyEmail(siteUrl: string, fallback: string): string {
  if (!siteUrl) return fallback;
  try {
    return `privacy@${new URL(siteUrl).hostname}`;
  } catch {
    return fallback;
  }
}
