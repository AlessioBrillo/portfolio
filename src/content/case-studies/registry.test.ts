import { describe, expect, it, vi } from 'vitest';
import {
  CASE_STUDIES,
  getCaseStudy,
  getPublishedCaseStudies,
  isPublishedStudy,
} from '@/content/case-studies/registry';
import type { CaseStudyDomain } from '@/types/domain';
import corpusBody from '@/content/case-studies/transformer-italian-corpus.mdx?raw';
import ascentBody from '@/content/case-studies/work-the-ascent.mdx?raw';
import vdsBody from '@/content/case-studies/vds-licence.mdx?raw';

const VALID_DOMAINS: readonly CaseStudyDomain[] = ['ai', 'work', 'sky'];

vi.mock('@/content/case-studies/transformer-italian-corpus.mdx', () => ({
  default: () => null,
}));
vi.mock('@/content/case-studies/vds-licence.mdx', () => ({
  default: () => null,
}));
vi.mock('@/content/case-studies/work-the-ascent.mdx', () => ({
  default: () => null,
}));
vi.mock('@/content/case-studies/next-ai-physics.mdx', () => ({
  default: () => null,
}));

describe('getCaseStudy', () => {
  it('returns the entry for a known slug', () => {
    const entry = getCaseStudy('transformer-italian-corpus');
    expect(entry).toBeDefined();
    expect(entry?.meta.slug).toBe('transformer-italian-corpus');
    expect(entry?.meta.domain).toBe('ai');
    expect(entry?.load).toBeInstanceOf(Function);
  });

  it('returns the sky-domain entry for the VDS licence study', () => {
    const entry = getCaseStudy('vds-licence');
    expect(entry).toBeDefined();
    expect(entry?.meta.slug).toBe('vds-licence');
    expect(entry?.meta.domain).toBe('sky');
    expect(entry?.load).toBeInstanceOf(Function);
  });

  it('returns the work-domain entry for The Ascent study', () => {
    const entry = getCaseStudy('the-ascent');
    expect(entry).toBeDefined();
    expect(entry?.meta.slug).toBe('the-ascent');
    expect(entry?.meta.domain).toBe('work');
    expect(entry?.load).toBeInstanceOf(Function);
  });

  it('returns undefined for an unknown slug', () => {
    expect(getCaseStudy('non-existent')).toBeUndefined();
  });

  it('resolves the draft AI study: registered, complete, and unpublished', () => {
    const entry = getCaseStudy('next-ai-physics');
    expect(entry).toBeDefined();
    expect(entry?.meta.domain).toBe('ai');
    expect(entry?.meta.slug).toBe('next-ai-physics');
    expect(entry?.load).toBeInstanceOf(Function);
    const publishedSlugs = getPublishedCaseStudies().map((meta) => meta.slug);
    expect(publishedSlugs).not.toContain('next-ai-physics');
  });
  it('resolves every registered study loader, draft included', async () => {
    for (const entry of Object.values(CASE_STUDIES)) {
      const mod = await entry.load();
      expect(mod.default, entry.meta.slug).toBeTypeOf('function');
    }
  });
});

describe('registry content contract', () => {
  it('keys every entry by its own domain/slug pair — the route identity', () => {
    for (const [key, entry] of Object.entries(CASE_STUDIES)) {
      expect(key, `key for ${entry.meta.slug}`).toBe(`${entry.meta.domain}/${entry.meta.slug}`);
    }
  });

  it('every registered study — published or draft — carries complete metadata', () => {
    for (const [key, entry] of Object.entries(CASE_STUDIES)) {
      const { meta } = entry;
      expect(meta.slug, key).toBe(key);
      expect(VALID_DOMAINS, key).toContain(meta.domain);
      expect(meta.title.trim().length, key).toBeGreaterThan(0);
      expect(meta.role.trim().length, key).toBeGreaterThan(0);
      expect(meta.year.trim().length, key).toBeGreaterThan(0);
      expect(meta.summary.trim().length, key).toBeGreaterThan(0);
      expect(meta.stack.length, key).toBeGreaterThan(0);
      expect(entry.load, key).toBeInstanceOf(Function);
    }
  });
});

/**
 * Author-slot markers: the placeholders a study template leaves behind until
 * the author fills real content. A published study must never carry one —
 * drafts may (they are templates by definition), so this contract checks only
 * the published bodies.
 */
const AUTHOR_SLOT_MARKERS: readonly string[] = ['Author slot', 'fill in', 'TBD', '**—**'];

/** Maps each marker to the 1-based lines where it occurs in a body. */
function collectMarkerLines(body: string): Readonly<Record<string, readonly number[]>> {
  const lines = body.split('\n');
  const found: Record<string, readonly number[]> = {};
  for (const marker of AUTHOR_SLOT_MARKERS) {
    const lineNumbers: number[] = [];
    lines.forEach((line, index) => {
      if (line.includes(marker)) lineNumbers.push(index + 1);
    });
    if (lineNumbers.length > 0) {
      found[marker] = Object.freeze(lineNumbers);
    }
  }
  return Object.freeze(found);
}

/** A per-study record of markers that must still be cleared by the author. */
interface MarkerDebt {
  readonly slug: string;
  readonly markers: Readonly<Record<string, readonly number[]>>;
}

/**
 * Known content debt: markers still present in *published* bodies. The exact
 * match below keeps this list honest — any marker not listed here fails the
 * contract (nothing new slips in), and a listed marker that disappears fails
 * too (the debt entry must be deleted the moment the real content lands).
 * The debt is author input, never code: each entry names the line that must
 * be filled with real data before the entry is removed.
 */
const KNOWN_DEBT: readonly MarkerDebt[] = [
  {
    slug: 'transformer-italian-corpus',
    markers: {
      'fill in': [40, 64, 87],
      '**—**': [42, 89, 90, 91],
    },
  },
  {
    slug: 'the-ascent',
    markers: {
      'Author slot': [106],
    },
  },
];

const PUBLISHED_BODIES: Readonly<Record<string, string>> = {
  'transformer-italian-corpus': corpusBody,
  'the-ascent': ascentBody,
  'vds-licence': vdsBody,
};

describe('published body contract', () => {
  for (const meta of getPublishedCaseStudies()) {
    it(`${meta.slug} body is free of author-slot markers, exact match with KNOWN_DEBT`, () => {
      const body = PUBLISHED_BODIES[meta.slug];
      expect(body, `published body missing for ${meta.slug}`).toBeDefined();
      const actual = collectMarkerLines(body ?? '');
      const expected =
        KNOWN_DEBT.find((debt) => debt.slug === meta.slug)?.markers ?? Object.freeze({});
      expect(actual).toEqual(expected);
    });
  }

  it('every KNOWN_DEBT entry belongs to a published study', () => {
    const publishedSlugs = getPublishedCaseStudies().map((meta) => meta.slug);
    for (const debt of KNOWN_DEBT) {
      expect(publishedSlugs, `debt on non-published slug ${debt.slug}`).toContain(debt.slug);
    }
  });
});

describe('published metadata contract', () => {
  it('published metadata is production-ready: no placeholder role, title, or stub fields', () => {
    for (const meta of getPublishedCaseStudies()) {
      expect(meta.role, meta.slug).not.toMatch(/tbd/i);
      expect(meta.title, meta.slug).not.toMatch(/placeholder/i);
      expect(meta.year, meta.slug).toMatch(/^\d{4}$/);
      expect(meta.stack.length, meta.slug).toBeGreaterThan(0);
      expect(meta.summary.trim().length, meta.slug).toBeGreaterThanOrEqual(40);
    }
  });
});

describe('getPublishedCaseStudies', () => {
  it('returns every registered study exactly once, in curated order', () => {
    const slugs = getPublishedCaseStudies().map((meta) => meta.slug);
    expect(slugs).toEqual(['transformer-italian-corpus', 'the-ascent', 'vds-licence']);
  });

  it('exposes the metadata the sitemap and prev/next navigation need', () => {
    const first = getPublishedCaseStudies()[0];
    expect(first).toMatchObject({ domain: 'ai', slug: 'transformer-italian-corpus' });
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('year');
  });
});

describe('isPublishedStudy', () => {
  it('returns true for every study in the curated order', () => {
    for (const meta of getPublishedCaseStudies()) {
      expect(isPublishedStudy(meta.slug)).toBe(true);
    }
  });

  it('returns false for the registered draft study', () => {
    expect(isPublishedStudy('next-ai-physics')).toBe(false);
  });

  it('returns false for an unknown slug', () => {
    expect(isPublishedStudy('non-existent')).toBe(false);
  });
});
