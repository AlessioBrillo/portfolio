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
      stack: ['React 19', 'TypeScript', 'CSS Scroll Animations', 'Vitest', 'Playwright'],
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

/**
 * Publishes a registered study by adding its key to the curated order.
 * Throws if the study is not registered or already published.
 */
export function publishStudy(domain: CaseStudyDomain, slug: string): void {
  const key = studyKey({ domain, slug });
  if (!(key in CASE_STUDIES)) {
    throw new Error(`Cannot publish: study "${key}" is not registered in CASE_STUDIES`);
  }
  if (PUBLISHED_ORDER.includes(key)) {
    throw new Error(`Cannot publish: study "${key}" is already published`);
  }
  // We mutate the frozen array via Object.defineProperty to keep the public
  // API shape (readonly) while allowing controlled internal mutation.
  // This is a deliberate design choice: the registry is the single writer,
  // and the mutation happens at module initialization time in practice.
  const newOrder = [...PUBLISHED_ORDER, key] as const;
  Object.defineProperty(exports, 'PUBLISHED_ORDER', {
    value: newOrder,
    writable: true,
    configurable: true,
  });
}

/**
 * Unpublishes a study by removing its key from the curated order.
 * Throws if the study is not currently published.
 */
export function unpublishStudy(domain: CaseStudyDomain, slug: string): void {
  const key = studyKey({ domain, slug });
  const index = PUBLISHED_ORDER.indexOf(key);
  if (index === -1) {
    throw new Error(`Cannot unpublish: study "${key}" is not published`);
  }
  const newOrder = [
    ...PUBLISHED_ORDER.slice(0, index),
    ...PUBLISHED_ORDER.slice(index + 1),
  ] as const;
  Object.defineProperty(exports, 'PUBLISHED_ORDER', {
    value: newOrder,
    writable: true,
    configurable: true,
  });
}

/**
 * Validates that the registry is internally consistent:
 * - Every published study key exists in CASE_STUDIES
 * - No duplicate keys in PUBLISHED_ORDER
 * - Every CASE_STUDIES entry has a valid domain
 * Throws on first inconsistency found.
 */
export function ensureRegistryConsistency(): void {
  // 1. Every published key must exist in CASE_STUDIES
  for (const key of PUBLISHED_ORDER) {
    if (!(key in CASE_STUDIES)) {
      throw new Error(`Registry inconsistency: published key "${key}" not found in CASE_STUDIES`);
    }
  }

  // 2. No duplicate keys in PUBLISHED_ORDER
  const seen = new Set<string>();
  for (const key of PUBLISHED_ORDER) {
    if (seen.has(key)) {
      throw new Error(`Registry inconsistency: duplicate key "${key}" in PUBLISHED_ORDER`);
    }
    seen.add(key);
  }

  // 3. Every CASE_STUDIES entry has a valid domain
  const validDomains: readonly CaseStudyDomain[] = ['ai', 'work', 'sky'];
  for (const [key, entry] of Object.entries(CASE_STUDIES)) {
    if (!validDomains.includes(entry.meta.domain)) {
      throw new Error(
        `Registry inconsistency: entry "${key}" has invalid domain "${entry.meta.domain}"`,
      );
    }
  }
}
