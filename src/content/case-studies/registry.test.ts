import { describe, expect, it } from 'vitest';
import { getCaseStudy, getPublishedCaseStudies } from '@/content/case-studies/registry';

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
