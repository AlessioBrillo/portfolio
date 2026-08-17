import { describe, expect, it, vi } from 'vitest';
import {
  CASE_STUDIES,
  getCaseStudy,
  getPublishedCaseStudies,
  isPublishedStudy,
} from '@/content/case-studies/registry';
import type { CaseStudyDomain } from '@/types/domain';

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
