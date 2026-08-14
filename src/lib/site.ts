/**
 * Single source of truth for the site's identity and contact surface.
 *
 * Components and hooks read from here instead of hardcoding values, so the
 * deploy step (roadmap Phase 6) only has to fill in `siteUrl`.
 */
export const SITE = {
  /** Full name, used in the hero, footer and document titles. */
  name: 'Alessio Brillo',
  /** One-line identity used in the footer. */
  tagline: 'Student of AI and physics — building, flying, learning.',
  /** Public contact address behind the final CTA. */
  email: 'alessio@ilcassero.it',
  /** Public profile for the ghost link in Contact. */
  linkedinUrl: 'https://www.linkedin.com/in/alessio-brillo',
  /**
   * The public repository this site lives in (ADR-0014: the repo is part of
   * the portfolio — the claim is verifiable from the rendered site itself).
   */
  githubUrl: 'https://github.com/AlessioBrillo/portfolio',
  /**
   * The resume-on-request hook (ADR-0014): a pre-filled email instead of a
   * published file, so the resume can never go stale in public.
   */
  resumeUrl: 'mailto:alessio@ilcassero.it?subject=Resume%20request',
  /**
   * Canonical origin for case-study links and the build-time sitemap.
   *
   * Single source of truth shared with `scripts/generate-sitemap.mjs`: the
   * `VITE_SITE_URL` env pair (see `.env.example`). Leave unset until the real
   * domain is configured; `canonicalOrigin()` then falls back to the deployed
   * origin, which is exactly correct for the interim vercel.app deployment.
   */
  siteUrl: import.meta.env.VITE_SITE_URL ?? '',
} as const;

/**
 * The origin used for `rel=canonical` links. Prefers the configured domain;
 * while it is empty (pre-deploy) the current window origin is authoritative —
 * which is exactly correct for the live deployment at any given time.
 */
export function canonicalOrigin(siteUrl: string = SITE.siteUrl): string {
  if (siteUrl) return siteUrl.replace(/\/+$/, '');
  return typeof window === 'undefined' ? '' : window.location.origin;
}
