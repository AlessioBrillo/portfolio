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
 * When the env pair is unset the middleware answers 404 directly, so these
 * paths never fall through to the SPA fallback (vercel.json excludes them):
 * serving index.html as JavaScript would MIME-block the script tag.
 *
 * Uses standard Web APIs (Request, Response, fetch) — no Next.js dependency.
 * Declared in vercel.json under functions.middleware.ts with runtime: edge.
 */

const PLAUSIBLE_SCRIPT_PATH = '/js/script.js';
const PLAUSIBLE_EVENT_PATH = '/api/event';
const PLAUSIBLE_TARGET_ORIGIN = 'https://plausible.io';

function notFound(): Response {
  return new Response('Not found', {
    status: 404,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function methodNotAllowed(): Response {
  return new Response('Method not allowed', {
    status: 405,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

/** The configured script origin, or undefined when the env value is missing or malformed. */
function configuredScriptOrigin(): string | undefined {
  const plausibleSrc = process.env.VITE_PLAUSIBLE_SRC;
  if (!plausibleSrc) return undefined;
  try {
    return new URL(plausibleSrc).origin;
  } catch {
    console.warn('[Plausible Middleware] Malformed VITE_PLAUSIBLE_SRC, proxy disabled.');
    return undefined;
  }
}

export default async function middleware(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const { pathname } = url;

  // Only handle the two Plausible proxy routes
  if (pathname !== PLAUSIBLE_SCRIPT_PATH && pathname !== PLAUSIBLE_EVENT_PATH) {
    return undefined; // Continue to next middleware or static files
  }

  const plausibleSrc = process.env.VITE_PLAUSIBLE_SRC;
  const plausibleDomain = process.env.VITE_PLAUSIBLE_DOMAIN;

  // Proxy only active when BOTH env vars are set (ADR-0020). Answer 404
  // directly so the request never reaches the SPA fallback as HTML.
  if (!plausibleSrc || !plausibleDomain) {
    return notFound();
  }

  // Validate the target origin to prevent open proxy (never throws: see above)
  if (configuredScriptOrigin() !== PLAUSIBLE_TARGET_ORIGIN) {
    console.warn('[Plausible Middleware] Unexpected script origin, proxy disabled.');
    return notFound();
  }

  try {
    if (pathname === PLAUSIBLE_SCRIPT_PATH) {
      if (request.method !== 'GET') {
        return methodNotAllowed();
      }
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
        return methodNotAllowed();
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

      // Echo the request origin for CORS; omit the header when absent so the
      // response is never implicitly wildcarded. Beacons must not be cached.
      const requestOrigin = request.headers.get('Origin');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
        'Vary': 'Origin',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      };
      if (requestOrigin) {
        headers['Access-Control-Allow-Origin'] = requestOrigin;
      }
      return new Response(response.body, { status: response.status, headers });
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
