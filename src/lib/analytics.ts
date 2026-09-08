/**
 * Privacy-first analytics bootstrap (ADR-0013, ADR-0020, ADR-0024). Loads the
 * Plausible script — self-proxied through the site's own origin via Edge
 * Middleware.
 *
 * The client ALWAYS injects the script. The Edge Middleware (`middleware.ts`)
 * is the SOLE gate: it returns 404 for `/js/script.js` and `/api/event` when
 * `VITE_PLAUSIBLE_SRC` + `VITE_PLAUSIBLE_DOMAIN` are not both set. This
 * eliminates the client/middleware desync risk (build-time vs runtime env).
 *
 * Dev, tests, pre-domain deploys: middleware returns 404 → script fails
 * silently (no third-party request). Domain deploys: middleware proxies to
 * plausible.io. CSP `script-src 'self'` + `connect-src 'self'` stays strict.
 */
export function initAnalytics(): void {
  const dataDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!dataDomain) return;
  if (typeof document === 'undefined') return;

  const existing = document.head.querySelector<HTMLScriptElement>(
    `script[data-domain="${dataDomain}"]`,
  );
  if (existing) return;

  const script = document.createElement('script');
  // Proxied by middleware; returns 404 if env vars not configured (ADR-0024)
  script.src = '/js/script.js';
  script.setAttribute('async', '');
  script.setAttribute('defer', '');
  script.dataset.domain = dataDomain;

  // Proxied by middleware; same-origin guard enforced there
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
