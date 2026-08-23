import { expect, test } from '@playwright/test';
import { hasCanonicalOrigin } from './env';

/**
 * The archive surface (ADR-0019): the deep link resolves to the chronological
 * record with its route head, and the Experiences band's "dig deeper" link
 * reaches it through SPA navigation — the pieces unit tests cannot render in
 * a browser.
 */
test.describe('archive route', () => {
  test('deep link renders /archive with its route head', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('The archive');
    await expect(page).toHaveTitle(/The archive/);
    await expect(page.getByRole('link', { name: /Back to the ascent/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
    // Published surface: no robots meta, and the canonical link appears
    // exactly when the deployment set VITE_SITE_URL (src/lib/site.ts) — the
    // assertion flips with the env so the production build stays testable.
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(hasCanonicalOrigin ? 1 : 0);
  });

  test('"dig deeper" reaches the archive through SPA navigation', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-1440',
      'Viewport-independent DOM assertion; a single project suffices.',
    );
    await page.goto('/');
    // Locate by href since the link text contains an em dash that may not match regex reliably
    const link = page.locator('a[href="/archive"]');
    await expect(link).toBeVisible({ timeout: 10000 });
    await link.click();
    await expect(page).toHaveURL(/\/archive$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('The archive');
  });
});
