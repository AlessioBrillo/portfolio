import { defineConfig } from '@playwright/test';
import baseConfig from './playwright.config';

/**
 * Production-build harness: the same e2e suite against `vite preview`
 * instead of the dev server. Catches what only exists in a real build —
 * hashed asset URLs, code-split chunks, the SPA fallback, the postbuild
 * sitemap step — with the same browser assertions (ADR-0003, ADR-0010).
 * Run with `npm run e2e:preview`; wired into CI alongside the dev harness.
 */
export default defineConfig({
  ...baseConfig,
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  // The dev harness already covers the viewport matrix; the preview profile
  // exists to validate the built artifact, so one desktop viewport plus the
  // reduced-motion path is enough.
  projects: baseConfig.projects!.filter(
    (project) => project.name === 'desktop-1440' || project.name === 'reduced-motion',
  ),
});