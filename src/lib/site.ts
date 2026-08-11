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
   * Canonical origin for case-study links. Leave empty until the real domain
   * is configured; `canonicalOrigin()` then falls back to the deployed origin.
   */
  siteUrl: '',
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
