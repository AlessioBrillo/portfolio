import { expect, test } from '@playwright/test';
import { hasAnalytics } from './env';

/**
 * Validates the Plausible analytics proxy middleware (ADR-0013, ADR-0020):
 * - When env vars are set: /js/script.js proxies to plausible.io, /api/event proxies beacons
 * - When env vars are NOT set: both routes fall through to SPA fallback (no external calls)
 * - CSP headers are correct on proxied responses
 */
test.describe('plausible analytics proxy middleware', () => {
  test('GET /js/script.js proxies to plausible.io when env vars set', async ({ page }) => {
    test.skip(!hasAnalytics, 'requires VITE_PLAUSIBLE_SRC and VITE_PLAUSIBLE_DOMAIN');

    const response = await page.goto('/js/script.js', { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();
    expect(response!.status()).toBe(200);
    expect(response!.headers()['content-type']).toContain('application/javascript');

    // Verify it's the actual Plausible script (contains plausible identifier)
    const body = await response!.text();
    expect(body).toContain('plausible');
    expect(body).not.toContain('<html'); // Not SPA fallback

    // Verify caching headers
    expect(response!.headers()['cache-control']).toContain('immutable');
    expect(response!.headers()['cache-control']).toContain('max-age=31536000');
  });

  test('GET /js/script.js falls back to SPA when env vars NOT set', async ({ page }) => {
    test.skip(hasAnalytics, 'only meaningful when analytics env vars are NOT set');

    const response = await page.goto('/js/script.js', { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();

    // Should serve index.html (SPA fallback) — 200 with HTML content
    expect(response!.status()).toBe(200);
    expect(response!.headers()['content-type']).toContain('text/html');
  });

  test('POST /api/event proxies to plausible.io when env vars set', async ({ page }) => {
    test.skip(!hasAnalytics, 'requires VITE_PLAUSIBLE_SRC and VITE_PLAUSIBLE_DOMAIN');

    // Send a beacon via fetch (navigator.sendBeacon not easily testable in Playwright)
    const response = await page.request.post('/api/event', {
      data: { n: 'pageview', u: 'https://example.com/', d: 'example.com' },
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/json');

    // Verify CORS headers
    expect(response.headers()['access-control-allow-origin']).toBeTruthy();
    expect(response.headers()['access-control-allow-methods']).toContain('POST');
  });

  test('POST /api/event rejects non-POST methods', async ({ page }) => {
    test.skip(!hasAnalytics, 'requires VITE_PLAUSIBLE_SRC and VITE_PLAUSIBLE_DOMAIN');

    const response = await page.request.get('/api/event');
    expect(response.status()).toBe(405);
  });

  test('POST /api/event does not call plausible.io when env vars NOT set', async ({ page }) => {
    test.skip(hasAnalytics, 'only meaningful when analytics env vars are NOT set');

    const response = await page.request.post('/api/event', {
      data: { n: 'pageview' },
      headers: { 'Content-Type': 'application/json' },
    });

    // When middleware is inactive (no env vars), it returns undefined and the request
    // continues. Vercel's SPA fallback rewrite only handles GET, so POST returns 404.
    // The critical assertion: no external call to plausible.io (validated by the
    // 'no external network calls' test). Accept 404 or 200 (SPA fallback).
    expect([200, 404]).toContain(response.status());
  });

  test('proxied script has restrictive CSP', async ({ page }) => {
    test.skip(!hasAnalytics, 'requires VITE_PLAUSIBLE_SRC and VITE_PLAUSIBLE_DOMAIN');

    const response = await page.goto('/js/script.js', { waitUntil: 'networkidle' });
    expect(response).not.toBeNull();

    const csp = response!.headers()['content-security-policy'];
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain('unsafe-inline');
    expect(csp).not.toContain('plausible.io');
  });

  test('no external network calls to plausible.io when env vars NOT set', async ({ page }) => {
    test.skip(hasAnalytics, 'only meaningful when analytics env vars are NOT set');

    const externalCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('plausible.io')) {
        externalCalls.push(request.url());
      }
    });

    await page.goto('/js/script.js', { waitUntil: 'networkidle' });
    await page.request.post('/api/event', { data: { n: 'pageview' } });

    expect(externalCalls).toHaveLength(0);
  });
});