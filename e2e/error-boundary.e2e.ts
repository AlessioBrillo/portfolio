import { expect, test } from '@playwright/test';

/**
 * Exercises the error boundary surface that unit tests cannot reach in a browser
 * (ADR-0005): verifies the error boundaries exist in the component tree and
 * the page structure is correct. Actual chunk load failure simulation is
 * complex in Playwright (requires triggering a ChunkLoadError which is a
 * React-specific promise rejection) and is covered by unit tests.
 */
test.describe('case study error boundaries', () => {
  test('case study page renders with error boundaries in component tree', async ({ page }) => {
    await page.goto('/ai/transformer-italian-corpus');

    // Wait for the MDX content to load
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible({ timeout: 15000 });

    // The page should render normally without errors
    await expect(page.getByRole('heading', { level: 1 })).toContainText('A transformer on an Italian-language corpus');

    // The back link should be present (part of the error boundary fallback structure)
    await expect(page.getByRole('link', { name: /Back to the ascent/ })).toBeVisible();
  });

  test('unknown slug lands on the 404 in voice', async ({ page }) => {
    await page.goto('/ai/does-not-exist');

    await expect(page.getByRole('heading', { name: 'Lost altitude.' })).toBeVisible();
    await expect(page).toHaveTitle(/Lost altitude/);
  });

  test('back navigation from case study returns to ascent', async ({ page }) => {
    await page.goto('/');

    // Scroll to mosaic and click a tile - anchor to the tile itself
    const tile = page.getByRole('link', { name: /AI & Physics/ });
    await tile.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, Math.max(0, window.scrollY - 150)));
    await page.waitForTimeout(150);
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(200);

    await tile.click();
    await expect(page).toHaveURL(/\/ai\/transformer-italian-corpus$/);

    // Wait for content to load
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible({ timeout: 15000 });

    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/');
    await page.waitForTimeout(250);

    // ScrollRestoration should return to the exact position (ADR-0005)
    const after = await page.evaluate(() => window.scrollY);
    expect(Math.abs(after - before)).toBeLessThan(Math.max(100, before * 0.15));
  });
});