import type { ComponentType } from 'react';
import type { CaseStudyMeta, CaseStudyDomain } from '@/types/domain';

interface CaseStudyEntry {
  readonly meta: CaseStudyMeta;
  /** Lazy loader for the MDX body, code-split per case study. */
  readonly load: () => Promise<{ default: ComponentType }>;
}

/** Type-safe registry key combining domain and slug. */
type DomainKey = `${CaseStudyDomain}/${string}`;

/**
 * The registry key is the route identity itself, `{domain}/{slug}` (ADR-0005),
 * so two studies can never collide on a slug across domains — the map key and
 * the URL stay in bijection.
 */
function studyKey(meta: Pick<CaseStudyMeta, 'domain' | 'slug'>): DomainKey {
  return `${meta.domain}/${meta.slug}`;
}

/**
 * The single source of truth for case studies. Add an entry here and drop a
 * sibling `.mdx` file; the `/{domain}/{slug}` route renders it (ADR-0005).
 *
 * Drafting: an entry in `CASE_STUDIES` that is not in `PUBLISHED_ORDER` is a
 * draft — its route is resolvable for review, but it stays out of the mosaic,
 * the sitemap, and the prev/next navigation until it is added to the order.
 */
export const CASE_STUDIES: Readonly<Record<DomainKey, CaseStudyEntry>> = {
  'ai/transformer-italian-corpus': {
    meta: {
      slug: 'transformer-italian-corpus',
      domain: 'ai',
      title: 'A transformer on an Italian-language corpus',
      role: 'Independent project',
      year: '2025',
      stack: ['PyTorch', 'Tokenizers', 'Python'],
      summary: 'Training a small transformer from scratch on Italian text.',
    },
    load: () => import('./transformer-italian-corpus.mdx'),
  },
  'sky/vds-licence': {
    meta: {
      slug: 'vds-licence',
      domain: 'sky',
      title: 'The VDS licence, on purpose',
      role: 'Personal discipline',
      year: '2026',
      stack: ['Ultralight aircraft', 'VDS licence'],
      summary: 'Earning the Italian ultralight licence as a study in decision hygiene.',
    },
    load: () => import('./vds-licence.mdx'),
  },
  'work/the-ascent': {
    meta: {
      slug: 'the-ascent',
      domain: 'work',
      title: 'The Ascent, engineered in the open',
      role: 'Engineering showcase',
      year: '2026',
      stack: ['React 19', 'TypeScript', 'GSAP', 'Vitest', 'Playwright'],
      summary:
        'The portfolio as an engineered artifact — a scroll-driven tonal flight, committed in the open.',
    },
    load: () => import('./work-the-ascent.mdx'),
  },
  'ai/grokking-modular-addition': {
    meta: {
      slug: 'grokking-modular-addition',
      domain: 'ai',
      title: 'In search of grokking: a positive-negative on modular addition',
      role: 'Independent research',
      year: '2026',
      stack: ['PyTorch', 'Mechanistic interpretability', 'Python'],
      summary:
        'Three seeds, five thousand epochs, and an honest negative — the search for the grokking phase transition on modular addition.',
    },
    load: () => import('./grokking-modular-addition.mdx'),
  },
  /**
   * The physics half of the AI & Physics core — the flight manual derived
   * from first principles, companion to the VDS licence study. Published
   * with the POH figures and the logbook example tracked as KNOWN_DEBT in
   * the registry contract (same discipline as the corpus study's run-log
   * numbers): the ledger entry self-expires the day the author fills them.
   */
  'ai/physics-of-flight': {
    meta: {
      slug: 'physics-of-flight',
      domain: 'ai',
      title: 'The physics of flight: owning the numbers in the flight manual',
      role: 'Independent study',
      year: '2026',
      stack: ['Aerodynamics', 'Flight physics', 'VDS licence'],
      summary:
        'Deriving the flight manual from first principles — stall speed, glide and ground effect, in the ultralight regime.',
    },
    load: () => import('./physics-of-flight.mdx'),
  },
};

/** The entry for a route pair, or `undefined` when the route is unknown. */
export function getCaseStudy(domain: CaseStudyDomain, slug: string): CaseStudyEntry | undefined {
  return CASE_STUDIES[`${domain}/${slug}` as DomainKey];
}

/**
 * Curated reading order for the published studies — the source of truth for
 * cross-study prev/next navigation, the build-time sitemap, and the
 * publish/draft boundary (ADR-0015, ADR-0017). The order is the mosaic's
 * narrative: the serious core first (all three AI studies — the language
 * one, the grokking one, the flight physics one), the engineered showcase
 * next, the sky closing the flight.
 */
const PUBLISHED_ORDER: readonly string[] = [
  'ai/transformer-italian-corpus',
  'ai/grokking-modular-addition',
  'ai/physics-of-flight',
  'work/the-ascent',
  'sky/vds-licence',
];

/**
 * True when the study is published — its `domain/slug` key is in
 * `PUBLISHED_ORDER`. Unpublished registrations are drafts (ADR-0017): their
 * routes stay resolvable for review but render `noindex` so search engines
 * never surface them.
 */
export function isPublishedStudy(meta: Pick<CaseStudyMeta, 'domain' | 'slug'>): boolean {
  return PUBLISHED_ORDER.includes(studyKey(meta));
}

/** The published studies' metadata, in curated order (never the raw map). */
export function getPublishedCaseStudies(): readonly CaseStudyMeta[] {
  // The registry content contract test pins every PUBLISHED_ORDER key to a
  // registered entry, so the lookup below can never miss (ADR-0017).
  return PUBLISHED_ORDER.map((key) => CASE_STUDIES[key as DomainKey]!.meta);
}
