/**
 * Pure validation for site URL - no environment dependencies.
 * Used by build-time validation script and unit tests.
 */
export function validateSiteUrl(siteUrl: string): { valid: boolean; error?: string } {
  if (!siteUrl) return { valid: true }; // unset is valid (pre-domain)
  try {
    const url = new URL(siteUrl);
    if (url.protocol !== 'https:') return { valid: false, error: 'must use https://' };
    // URL constructor normalizes bare origins to have '/' pathname.
    // Accept '/' (root) but reject any other path.
    if (url.pathname !== '' && url.pathname !== '/')
      return { valid: false, error: 'must not include a path' };
    if (url.search) return { valid: false, error: 'must not include query parameters' };
    if (url.hash) return { valid: false, error: 'must not include a fragment' };
    /* v8 ignore next -- URL constructor requires hostname, unreachable in practice */
    if (!url.hostname) return { valid: false, error: 'must include a hostname' };
    return { valid: true };
  } catch {
    return { valid: false, error: 'invalid URL format' };
  }
}
