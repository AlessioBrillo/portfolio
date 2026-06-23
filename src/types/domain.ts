/**
 * Domain model for the portfolio.
 *
 * The site is a single tonal flight: scrolling flies a profile, and each band
 * (ground -> climb -> cruise -> descent -> night) maps to a life domain. These
 * types describe that journey and the case studies it links to. See ADR-0010.
 */

/** The five bands of the flight profile, in scroll order. */
export type AltitudeBand = 'ground' | 'climb' | 'cruise' | 'descent' | 'night';

/** Stable anchor ids for the page sections, top to bottom. */
export type SectionId =
  | 'hero'
  | 'who'
  | 'mosaic'
  | 'ai-physics'
  | 'work-school'
  | 'sky-sport'
  | 'experiences'
  | 'contact';

/** A clickable stop on the altitude gauge. */
export interface AltitudeStop {
  readonly band: AltitudeBand;
  /** Uppercase mono label shown on the gauge, e.g. "GROUND". */
  readonly label: string;
  /** The section anchored to this band when the label is activated. */
  readonly target: SectionId;
}

/** Top-level domains a case study can belong to (drives the URL prefix). */
export type CaseStudyDomain = 'ai' | 'work' | 'sky';

/** Surface-level metadata for a case study; the body lives in an MDX file. */
export interface CaseStudyMeta {
  readonly slug: string;
  readonly domain: CaseStudyDomain;
  readonly title: string;
  readonly role: string;
  readonly year: string;
  readonly stack: readonly string[];
  readonly summary: string;
}

/** A single tile in the mosaic index (section 02). */
export interface MosaicEntry {
  readonly id: string;
  readonly title: string;
  /** One-line teaser shown under the title. */
  readonly line: string;
  /** Optional deep link to a case study route. */
  readonly href?: string;
}
