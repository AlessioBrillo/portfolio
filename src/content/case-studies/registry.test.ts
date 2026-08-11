import { describe, expect, it } from 'vitest';
import { getCaseStudy } from '@/content/case-studies/registry';

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

  it('returns undefined for an unknown slug', () => {
    expect(getCaseStudy('non-existent')).toBeUndefined();
  });
});
