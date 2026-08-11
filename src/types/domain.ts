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
  /** Optional deep link to a case study route or a section anchor. */
  readonly href?: string;
}

/** A project in the work & school band (04). */
export interface ProjectEntry {
  readonly id: string;
  readonly title: string;
  /** One-line teaser shown under the title. */
  readonly line: string;
  /** Completion year, shown as mono metadata. */
  readonly year: string;
  /** Optional deep link to a case study route. */
  readonly href?: string;
}

/** A discipline shown in the sky & sport band (05). */
export interface SportEntry {
  readonly id: string;
  readonly title: string;
  /** One-line teaser shown under the title. */
  readonly line: string;
  /** Photo slot; the alt text is written for the intended photo (ADR-0009). */
  readonly image: {
    readonly alt: string;
    readonly caption?: string;
  };
}

/** A curated story in the experiences band (06). */
export interface ExperienceEntry {
  readonly id: string;
  readonly title: string;
  /** One-line teaser shown under the title. */
  readonly line: string;
  /** Optional year, shown as mono metadata. */
  readonly year?: string;
}

/** One of the three character statements in the who band (01). */
export interface WhoStatement {
  readonly id: string;
  readonly title: string;
  /** Shows the adjective made concrete, rather than claiming it. */
  readonly line: string;
}
