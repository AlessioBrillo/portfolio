import { describe, expect, it } from 'vitest';
import { validateSiteUrl } from '@/lib/validate-site-url';

describe('validateSiteUrl', () => {
  it('returns valid true for empty string (pre-domain)', () => {
    expect(validateSiteUrl('')).toEqual({ valid: true });
  });

  it('returns valid true for valid https URL with root path', () => {
    expect(validateSiteUrl('https://example.com')).toEqual({ valid: true });
    expect(validateSiteUrl('https://example.com/')).toEqual({ valid: true });
  });

  it('returns error for non-https protocol', () => {
    expect(validateSiteUrl('http://example.com')).toEqual({
      valid: false,
      error: 'must use https://',
    });
  });

  it('returns error for URL with non-root path', () => {
    expect(validateSiteUrl('https://example.com/path')).toEqual({
      valid: false,
      error: 'must not include a path',
    });
  });

  it('returns error for URL with query parameters', () => {
    expect(validateSiteUrl('https://example.com?query=1')).toEqual({
      valid: false,
      error: 'must not include query parameters',
    });
  });

  it('returns error for URL with fragment', () => {
    expect(validateSiteUrl('https://example.com#fragment')).toEqual({
      valid: false,
      error: 'must not include a fragment',
    });
  });

  it('returns error for invalid URL format', () => {
    expect(validateSiteUrl('not a url')).toEqual({
      valid: false,
      error: 'invalid URL format',
    });
  });

  it('accepts subdomain hostnames', () => {
    expect(validateSiteUrl('https://sub.example.com')).toEqual({ valid: true });
  });

  it('accepts port in URL', () => {
    expect(validateSiteUrl('https://example.com:443')).toEqual({ valid: true });
  });
});
