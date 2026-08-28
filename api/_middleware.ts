/**
 * Vercel Edge Middleware for conditional Plausible Analytics proxy (ADR-0013, ADR-0020).
 *
 * Replaces static vercel.json rewrites with runtime evaluation of
 * VITE_PLAUSIBLE_DOMAIN. This ensures zero third-party surface on preview
 * deployments and any environment where the domain is not explicitly configured.
 *
 * The middleware only activates when BOTH VITE_PLAUSIBLE_SRC and
 * VITE_PLAUSIBLE_DOMAIN are set (same contract as src/lib/analytics.ts).
 * When inactive, requests to /js/script.js and /api/event 404 naturally —
 * no beacon is emitted, no external connection is made.
 */

export const config = {
  runtime: 'edge',
  matcher: ['/js/script.js', '/api/event'],
};

export default async function middleware(request: Request): Promise<Response> {
  const plausibleSrc = process.env.VITE_PLAUSIBLE_SRC;
  const plausibleDomain = process.env.VITE_PLAUSIBLE_DOMAIN;

  // Analytics not configured — let the request fall through to 404
  // (or be handled by the SPA fallback in vercel.json)
  if (!plausibleSrc || !plausibleDomain) {
    return new Response(null, { status: 404 });
  }

  const url = new URL(request.url);

  // Proxy /js/script.js -> plausible.io/js/script.js
  if (url.pathname === '/js/script.js') {
    const targetUrl = new URL(plausibleSrc);
    targetUrl.pathname = '/js/script.js';
    return fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // Proxy /api/event -> plausible.io/api/event
  if (url.pathname === '/api/event') {
    const targetUrl = new URL(plausibleSrc);
    targetUrl.pathname = '/api/event';
    return fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  // Not a proxied path — continue to next middleware or SPA fallback
  return new Response(null, { status: 404 });
}