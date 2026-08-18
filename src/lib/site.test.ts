import { describe, expect, it, vi } from 'vitest';
import { canonicalOrigin, SITE } from '@/lib/site';

describe('site identity', () => {
  it('names the author', () => {
    expect(SITE.name).toBe('Alessio Brillo');
  });

  it('provides a usable email and profile link', () => {
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(SITE.linkedinUrl).toMatch(/^https:\/\/www\.linkedin\.com\//);
  });

  it('links the public repository this site lives in', () => {
    expect(SITE.githubUrl).toMatch(/^https:\/\/github\.com\/[^/]+\/[^/]+$/);
  });

  it('defaults to an empty canonical origin while VITE_SITE_URL is unset', () => {
    expect(SITE.siteUrl).toBe('');
  });

  it('offers the resume-on-request hook as a pre-filled mailto', () => {
    expect(SITE.resumeUrl).toMatch(/^mailto:alessio@ilcassero\.it\?subject=/);
  });
});

describe('canonicalOrigin', () => {
  it('returns an empty origin while no domain is configured (no canonical emitted)', () => {
    expect(canonicalOrigin()).toBe('');
  });

  it('prefers the configured domain once it exists', () => {
    expect(canonicalOrigin('https://example.com')).toBe('https://example.com');
    expect(canonicalOrigin('https://example.com/')).toBe('https://example.com');
  });

  it('treats an explicit empty domain like an unset one', () => {
    expect(canonicalOrigin('')).toBe('');
  });

  it('never falls back to the window origin, whatever the environment', () => {
    vi.stubGlobal('window', { location: { origin: 'https://unexpected.test' } });
    expect(canonicalOrigin()).toBe('');
    vi.unstubAllGlobals();
  });
});
