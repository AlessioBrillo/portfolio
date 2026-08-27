#!/usr/bin/env node
/**
 * Validates the VITE_SITE_URL environment variable at build time.
 * Fails the build if the URL is malformed (wrong protocol, path, query, etc.).
 * Skips silently when unset (pre-domain).
 */
import { validateSiteUrl } from '../src/lib/validate-site-url.ts';

const siteUrl = process.env.VITE_SITE_URL ?? '';

const result = validateSiteUrl(siteUrl);

if (!result.valid) {
  console.error(`[site-url] INVALID VITE_SITE_URL: ${result.error}`);
  console.error(`[site-url] Received: "${siteUrl}"`);
  console.error('[site-url] Expected: https://your-domain.com (no path, query, or fragment)');
  process.exit(1);
}

if (siteUrl) {
  console.log(`[site-url] Valid origin: ${siteUrl}`);
} else {
  console.log('[site-url] VITE_SITE_URL unset — skipping validation (pre-domain).');
}
