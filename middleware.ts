/**
 * Vercel Edge Function for conditional Plausible proxy (ADR-0020).
 *
 * Only activates the proxy rewrites when BOTH VITE_PLAUSIBLE_SRC and
 * VITE_PLAUSIBLE_DOMAIN environment variables are set. This keeps preview
 * and pre-domain deployments free of third-party requests.
 *
 * The middleware handles two routes:
 * - /js/script.js   -> proxies to plausible.io/js/script.js (from VITE_PLAUSIBLE_SRC)
 * - /api/event      -> proxies to plausible.io/api/event
 *
 * If env vars are not set, requests fall through to the SPA fallback
 * (handled by vercel.json rewrites) which returns index.html — effectively
 * a 404 for these paths without external network calls.
 *
 * Uses standard Web APIs (Request, Response, fetch) — no Next.js dependency.
 * Declared in vercel.json under functions.middleware.ts with runtime: edge.
 */

const PLAUSIBLE_SCRIPT_PATH = '/js/script.js';
const PLAUSIBLE_EVENT_PATH = '/api/event';
const PLAUSIBLE_TARGET_ORIGIN = 'https://plausible.io';

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const { pathname } = url;

  // Only handle the two Plausible proxy routes
  if (pathname !== PLAUSIBLE_SCRIPT_PATH && pathname !== PLAUSIBLE_EVENT_PATH) {
    return undefined; // Continue to next middleware or static files
  }

  const plausibleSrc = process.env.VITE_PLAUSIBLE_SRC;
  const plausibleDomain = process.env.VITE_PLAUSIBLE_DOMAIN;

  // Proxy only active when BOTH env vars are set (ADR-0020)
  if (!plausibleSrc || !plausibleDomain) {
    return undefined; // Fall through to SPA fallback (no external request)
  }

  // Validate the target origin to prevent open proxy
  const targetOrigin = new URL(plausibleSrc).origin;
  if (targetOrigin !== PLAUSIBLE_TARGET_ORIGIN) {
    console.warn(`[Plausible Middleware] Unexpected script origin: ${targetOrigin}`);
    return undefined;
  }

  try {
    if (pathname === PLAUSIBLE_SCRIPT_PATH) {
      // Proxy the Plausible script
      const response = await fetch(plausibleSrc, {
        method: 'GET',
        headers: {
          'User-Agent': request.headers.get('User-Agent') || '',
          'Accept': request.headers.get('Accept') || '*/*',
        },
      });

      if (!response.ok) {
        console.error(`[Plausible Middleware] Script fetch failed: ${response.status}`);
        return new Response('Script unavailable', { status: 502 });
      }

      // Forward the script with caching headers
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Security-Policy': "default-src 'self'; script-src 'self'",
        },
      });
    }

    if (pathname === PLAUSIBLE_EVENT_PATH) {
      // Proxy the event beacon (POST only)
      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      const requestBody = await request.text();
      const response = await fetch(`${PLAUSIBLE_TARGET_ORIGIN}/api/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': request.headers.get('Origin') || '',
          'User-Agent': request.headers.get('User-Agent') || '',
        },
        body: requestBody,
      });

      // Forward response from Plausible
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': request.headers.get('Origin') || '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    return undefined;
  } catch (error) {
    console.error('[Plausible Middleware] Proxy error:', error);
    return new Response('Proxy error', { status: 502 });
  }
}

export const config = {
  matcher: [PLAUSIBLE_SCRIPT_PATH, PLAUSIBLE_EVENT_PATH],
};