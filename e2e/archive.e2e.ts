import { expect, test } from '@playwright/test';

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
    // Published surface: no robots meta, and pre-domain no canonical link is
    // emitted (src/lib/site.ts) — previews must never advertise a throwaway
    // origin as the authoritative one.
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('"dig deeper" reaches the archive through SPA navigation', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-1440',
      'Viewport-independent DOM assertion; a single project suffices.',
    );
    await page.goto('/');
    await page.getByRole('link', { name: /Dig deeper/ }).click();
    await expect(page).toHaveURL(/\/archive$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('The archive');
  });
});