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

/**
 * A responsive photo asset: the image itself, its intrinsic dimensions and the
 * delivery hints. `src` is optional — while absent, components render a
 * labelled placeholder so the layout stays honest before real photos land
 * (roadmap Phase 5). `sources` lists typed variants (AVIF/WebP) for `<picture>`
 * delivery; `srcSet`/`sizes` pass through to the fallback `<img>`.
 *
 * `width`/`height` are the *intrinsic* pixel dimensions of `src` — they let
 * the browser reserve the true ratio before bytes arrive (CLS ~0, ADR-0009).
 * The optimization script (`scripts/optimize-images.mjs`) prints these values
 * together with the srcSet lines, so content modules never invent numbers.
 */
export interface ImageAsset {
  /** Fallback/primary URL, relative to the site root (`/photos/...`). */
  readonly src?: string;
  /** Typed responsive variants, rendered as `<picture>` sources. */
  readonly sources?: ReadonlyArray<{ readonly type: string; readonly srcSet: string }>;
  /** Flat srcSet for the fallback `<img>` (used when no `sources` are given). */
  readonly srcSet?: string;
  /** The `sizes` hint describing how wide the image renders. */
  readonly sizes?: string;
  /** Intrinsic width of the primary image in px. */
  readonly width?: number;
  /** Intrinsic height of the primary image in px. */
  readonly height?: number;
  /** Accessible name; written for the intended photo (ADR-0009). */
  readonly alt: string;
  /** Optional mono caption under the image. */
  readonly caption?: string;
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
  /** The discipline's photo slot — a full responsive asset (ADR-0009). */
  readonly image: ImageAsset;
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
