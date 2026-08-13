/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Analytics script URL (ADR-0013). Same-origin self-proxy (`/js/script.js`)
   * keeps the strict CSP in `vercel.json` valid; unset in dev and tests.
   */
  readonly VITE_PLAUSIBLE_SRC?: string;
  /** Domain the analytics beacon reports (the site's real domain). */
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  /** Optional self-proxied event endpoint (`/api/event`). */
  readonly VITE_PLAUSIBLE_API?: string;
  /** Optional SRI hash (`sha384-...`) for the analytics script. */
  readonly VITE_PLAUSIBLE_INTEGRITY?: string;
  /** Canonical origin for the build-time sitemap (`scripts/generate-sitemap.mjs`). */
  readonly VITE_SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
