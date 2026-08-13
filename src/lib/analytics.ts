/**
 * Privacy-first analytics bootstrap (ADR-0013). Loads the Plausible script —
 * ideally self-proxied through the site's own origin — only when the
 * deployment sets `VITE_PLAUSIBLE_SRC` + `VITE_PLAUSIBLE_DOMAIN`.
 *
 * Without the env pair (dev, tests, pre-domain deploys) this module is a
 * no-op, so the page stays free of third-party requests until the real domain
 * lands. The strict CSP in `vercel.json` keeps working unchanged: the
 * self-proxied script and beacon are same-origin (`script-src 'self'`,
 * `connect-src 'self'`), and an optional SRI hash hardens the script itself.
 */
export function initAnalytics(): void {
  const scriptSrc = import.meta.env.VITE_PLAUSIBLE_SRC;
  const dataDomain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
  if (!scriptSrc || !dataDomain) return;
  if (typeof document === 'undefined') return;

  const existing = document.head.querySelector<HTMLScriptElement>(
    `script[data-domain="${dataDomain}"]`,
  );
  if (existing) return;

  const script = document.createElement('script');
  script.src = scriptSrc;
  script.setAttribute('async', '');
  script.setAttribute('defer', '');
  script.dataset.domain = dataDomain;

  const api = import.meta.env.VITE_PLAUSIBLE_API;
  if (api) script.dataset.api = api;

  const integrity = import.meta.env.VITE_PLAUSIBLE_INTEGRITY;
  if (integrity) {
    script.integrity = integrity;
    script.crossOrigin = 'anonymous';
  }

  document.head.appendChild(script);
}
