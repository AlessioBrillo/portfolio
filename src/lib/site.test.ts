import { describe, expect, it } from 'vitest';
import { canonicalOrigin, SITE } from '@/lib/site';

describe('site identity', () => {
  it('names the author', () => {
    expect(SITE.name).toBe('Alessio Brillo');
  });

  it('provides a usable email and profile link', () => {
    expect(SITE.email).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(SITE.linkedinUrl).toMatch(/^https:\/\/www\.linkedin\.com\//);
  });
});

describe('canonicalOrigin', () => {
  it('falls back to the window origin while no domain is configured', () => {
    expect(canonicalOrigin()).toBe(window.location.origin);
  });

  it('prefers the configured domain once it exists', () => {
    expect(canonicalOrigin('https://example.com')).toBe('https://example.com');
    expect(canonicalOrigin('https://example.com/')).toBe('https://example.com');
  });

  it('treats an explicit empty domain like the default fallback', () => {
    expect(canonicalOrigin('')).toBe(window.location.origin);
  });
});
