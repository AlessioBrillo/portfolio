import { describe, expect, it } from 'vitest';
import { LEGAL_ROUTES, LEGAL_UPDATED, legalRoute, privacyEmail } from '@/lib/legal';

describe('legal surface contract', () => {
  it('publishes exactly the two legal routes in footer order', () => {
    expect(LEGAL_ROUTES.map((route) => route.path)).toEqual(['/privacy', '/legal']);
  });

  it('gives every route a title and a description', () => {
    for (const route of LEGAL_ROUTES) {
      expect(route.title.length).toBeGreaterThan(0);
      expect(route.description.length).toBeGreaterThan(0);
    }
  });

  it('uses an ISO lastmod date', () => {
    expect(LEGAL_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('looks up a route by path and rejects an unknown one', () => {
    expect(legalRoute('/privacy').title).toBe('Privacy');
    expect(() => legalRoute('/unknown' as '/privacy')).toThrow('Unknown legal route');
  });
});

describe('privacyEmail', () => {
  it('keeps the public mailbox before the domain lands', () => {
    expect(privacyEmail('', 'alessio@ilcassero.it')).toBe('alessio@ilcassero.it');
  });

  it('derives the dedicated alias from a configured origin', () => {
    expect(privacyEmail('https://example.com/', 'fallback@example.org')).toBe(
      'privacy@example.com',
    );
  });

  it('falls back when the configured origin is malformed', () => {
    expect(privacyEmail('not a url', 'fallback@example.org')).toBe('fallback@example.org');
  });
});
