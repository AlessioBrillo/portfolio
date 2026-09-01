/**
 * Privacy-first analytics bootstrap (ADR-0013, ADR-0020). Loads the Plausible script —
 * self-proxied through the site's own origin via Edge Middleware — only when the
 * deployment sets `VITE_PLAUSIBLE_SRC` + `VITE_PLAUSIBLE_DOMAIN`.
 *
 * Without the env pair (dev, tests, pre-domain deploys) this module is a
 * no-op, so the page stays free of third-party requests until the real domain
 * lands. The strict CSP in `vercel.json` keeps working unchanged: the
 * self-proxied script and beacon are same-origin (`script-src 'self'`,
 * `connect-src 'self'`), and an optional SRI hash hardens the script itself.
 *
 * The Edge Middleware (`middleware.ts`) conditionally rewrites:
 *   - /js/script.js -> plausible.io/js/script.js (from VITE_PLAUSIBLE_SRC)
 *   - /api/event    -> plausible.io/api/event
 * only when VITE_PLAUSIBLE_SRC and VITE_PLAUSIBLE_DOMAIN are both set.
 */
export function initAnalytics(): void {
  const dataDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  const scriptSrc = import.meta.env.VITE_PLAUSIBLE_SRC;
  if (!scriptSrc || !dataDomain) return;
  if (typeof document === 'undefined') return;

  const existing = document.head.querySelector<HTMLScriptElement>(
    `script[data-domain="${dataDomain}"]`,
  );
  if (existing) return;

  const script = document.createElement('script');
  // The middleware rewrites /js/script.js to the plausible.io URL from VITE_PLAUSIBLE_SRC
  script.src = '/js/script.js';
  script.setAttribute('async', '');
  script.setAttribute('defer', '');
  script.dataset.domain = dataDomain;

  // The middleware rewrites /api/event to plausible.io/api/event
  script.dataset.api = '/api/event';

  const integrity = import.meta.env.VITE_PLAUSIBLE_INTEGRITY;
  if (integrity) {
    script.integrity = integrity;
    script.crossOrigin = 'anonymous';
  }

  document.head.appendChild(script);
}

/**
 * Sends a non-blocking beacon to a same-origin endpoint using navigator.sendBeacon.
 * Used for operational telemetry (e.g., tonal engine health) that must not block
 * the main thread or affect page performance. Fails silently if sendBeacon is
 * unavailable (older browsers, SSR) or returns false (queue full).
 *
 * The endpoint must be same-origin to satisfy CSP `connect-src 'self'`.
 */
export function sendBeacon(url: string, data: Record<string, unknown>): void {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') {
    return;
  }
  try {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    navigator.sendBeacon(url, blob);
  } catch {
    // Swallow any unexpected errors — telemetry must never throw
  }
}
