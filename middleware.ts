import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Middleware for conditional Plausible Analytics proxy (ADR-0013, ADR-0020).
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
export function middleware(request: NextRequest) {
  const plausibleSrc = process.env.VITE_PLAUSIBLE_SRC;
  const plausibleDomain = process.env.VITE_PLAUSIBLE_DOMAIN;

  // Analytics not configured — let the request fall through to 404
  // (or be handled by the SPA fallback in vercel.json)
  if (!plausibleSrc || !plausibleDomain) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  // Proxy /js/script.js -> plausible.io/js/script.js
  if (url.pathname === '/js/script.js') {
    url.hostname = new URL(plausibleSrc).hostname;
    url.protocol = new URL(plausibleSrc).protocol;
    url.port = new URL(plausibleSrc).port;
    return NextResponse.rewrite(url);
  }

  // Proxy /api/event -> plausible.io/api/event
  if (url.pathname === '/api/event') {
    const target = `${new URL(plausibleSrc).protocol}//${new URL(plausibleSrc).hostname}`;
    url.hostname = new URL(target).hostname;
    url.protocol = new URL(target).protocol;
    url.port = new URL(target).port;
    url.pathname = '/api/event';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/js/script.js', '/api/event'],
};