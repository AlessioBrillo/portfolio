/**
 * Single source of truth for the site's identity and contact surface.
 *
 * Components and hooks read from here instead of hardcoding values, so the
 * deploy step (roadmap Phase 6) only has to fill in `siteUrl`.
 */
/**
 * Path of the published resume PDF under `public/` (ADR-0028), or `null`
 * while none is committed. While null the footer keeps the resume-on-request
 * mailto (ADR-0014). The day the file lands, set it to its URL path, e.g.
 * `/cv/alessio-brillo-cv.pdf`; a unit test fails if the path points at nothing.
 */
export const RESUME_PDF: string | null = null;

const RESUME_MAILTO = 'mailto:alessio@ilcassero.it?subject=Resume%20request';

export interface ResumeLink {
  href: string;
  label: string;
  /** True when the link opens a published file rather than a pre-filled email. */
  isFile: boolean;
}

/** The footer's resume link: the published PDF when there is one, else the mailto hook. */
export function resumeLink(pdfPath: string | null = RESUME_PDF): ResumeLink {
  return pdfPath
    ? { href: pdfPath, label: 'Resume — PDF', isFile: true }
    : { href: RESUME_MAILTO, label: 'Resume — on request', isFile: false };
}

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
  /** Where the footer's resume link points (see `resumeLink`, ADR-0028). */
  resumeUrl: resumeLink().href,
  /**
   * Canonical origin for case-study links and the build-time sitemap.
   *
   * Single source of truth shared with `scripts/generate-sitemap.mjs`: the
   * `VITE_SITE_URL` env pair (see `.env.example`). Leave unset until the real
   * domain is configured; `canonicalOrigin()` then returns an empty string, so
   * no canonical link is emitted at all — previews and forks never advertise
   * a throwaway origin as the authoritative one.
   */
  siteUrl: import.meta.env.VITE_SITE_URL ?? '',
} as const;

export { validateSiteUrl } from './validate-site-url';

/**
 * The origin used for `rel=canonical` links. Returns the configured domain
 * when one exists; while it is unset (pre-domain) the origin is empty and the
 * caller must omit the canonical link — the interim vercel.app deployment
 * stays truthful by having no canonical rather than a potentially wrong one.
 */
export function canonicalOrigin(siteUrl: string = SITE.siteUrl): string {
  if (siteUrl) return siteUrl.replace(/\/+$/, '');
  return '';
}

/**
 * The canonical URL for a case-study route, or `undefined` while no origin is
 * configured (pre-domain): callers then omit the link entirely rather than
 * emit a relative or throwaway canonical.
 */
export function canonicalStudyUrl(
  origin: string,
  domain: string,
  slug: string,
): string | undefined {
  if (!origin) return undefined;
  return `${origin}/${domain}/${slug}`;
}
