import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  canonicalOrigin,
  canonicalStudyUrl,
  RESUME_PDF,
  resumeLink,
  SITE,
  validateSiteUrl,
} from '@/lib/site';

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

describe('resume link (ADR-0028)', () => {
  it('falls back to the pre-filled mailto while no PDF is published', () => {
    const link = resumeLink(null);
    expect(link.label).toBe('Resume — on request');
    expect(link.isFile).toBe(false);
    expect(link.href).toMatch(/^mailto:alessio@ilcassero\.it\?subject=/);
  });

  it('points at the published file once a PDF path is set', () => {
    expect(resumeLink('/cv/alessio-brillo-cv.pdf')).toEqual({
      href: '/cv/alessio-brillo-cv.pdf',
      label: 'Resume — PDF',
      isFile: true,
    });
  });

  it('only ever references a PDF that is committed under public/', () => {
    if (RESUME_PDF === null) return; // slot still empty: the mailto hook is live
    expect(RESUME_PDF).toMatch(/^\/cv\/[\w.-]+\.pdf$/);
    expect(existsSync(resolve(process.cwd(), 'public', RESUME_PDF.slice(1)))).toBe(true);
  });
});

describe('validateSiteUrl', () => {
  it('accepts empty string (pre-domain)', () => {
    expect(validateSiteUrl('')).toEqual({ valid: true });
  });

  it('accepts valid HTTPS origin without path', () => {
    expect(validateSiteUrl('https://example.com')).toEqual({ valid: true });
    expect(validateSiteUrl('https://portfolio.example.com')).toEqual({ valid: true });
    expect(validateSiteUrl('https://my-domain.io')).toEqual({ valid: true });
  });

  it('rejects HTTP protocol', () => {
    expect(validateSiteUrl('http://example.com')).toEqual({
      valid: false,
      error: 'must use https://',
    });
  });

  it('rejects URLs with path', () => {
    // URL constructor normalizes bare origins to '/', so this is accepted
    expect(validateSiteUrl('https://example.com/')).toEqual({ valid: true });
    expect(validateSiteUrl('https://example.com/path')).toEqual({
      valid: false,
      error: 'must not include a path',
    });
  });

  it('rejects URLs with query parameters', () => {
    expect(validateSiteUrl('https://example.com?foo=bar')).toEqual({
      valid: false,
      error: 'must not include query parameters',
    });
  });

  it('rejects URLs with fragment', () => {
    expect(validateSiteUrl('https://example.com#section')).toEqual({
      valid: false,
      error: 'must not include a fragment',
    });
  });

  it('rejects invalid URL format', () => {
    expect(validateSiteUrl('not-a-url')).toEqual({ valid: false, error: 'invalid URL format' });
    expect(validateSiteUrl('https://')).toEqual({ valid: false, error: 'invalid URL format' });
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

describe('canonicalStudyUrl', () => {
  it('builds the case-study canonical from the configured origin', () => {
    expect(canonicalStudyUrl('https://example.com', 'ai', 'the-study')).toBe(
      'https://example.com/ai/the-study',
    );
    expect(canonicalStudyUrl('https://example.com', 'sky', 'vds-licence')).toBe(
      'https://example.com/sky/vds-licence',
    );
  });

  it('returns undefined without a configured origin (canonical omitted)', () => {
    expect(canonicalStudyUrl('', 'ai', 'the-study')).toBeUndefined();
  });
});
