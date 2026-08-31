import { defineConfig, devices } from '@playwright/test';

/**
 * Validates the tonal signature (ADR-0003, ADR-0010) end to end: the hero
 * loads, the paper<->night crossfade renders across breakpoints, and text
 * stays WCAG AA-legible through the fade in both motion modes. Unit tests
 * (`vitest`) cover pure logic; this harness is the only thing that actually
 * runs the GSAP ScrollTrigger timeline in a browser.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The dev-server harness transforms modules on demand under parallel
  // workers; the Playwright default (30s) times out cold-page loads.
  timeout: 60_000,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'mobile-320',
      use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 720 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 900 } },
    },
    {
      name: 'laptop-1024',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 900 } },
    },
    {
      name: 'desktop-1440',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 960 } },
    },
    {
      name: 'reduced-motion',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 960 },
        // `contextOptions` is the TestOption the runner unpacks into
        // browser.newContext(); it is the only path through which the
        // reduced-motion emulation reaches matchMedia (a bare `reducedMotion`
        // key in `use` is silently dropped — it is not a TestOption).
        contextOptions: { reducedMotion: 'reduce' },
      },
      timeout: 90_000,
    },
  ],
});
