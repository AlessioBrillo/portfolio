import { expect, test } from '@playwright/test';

/**
 * Exercises the case-study surface that unit tests cannot reach in a browser
 * (ADR-0005): deep links resolve to the study with its route head, unknown
 * slugs fall to the 404 in voice, and — the pipeline's promise — the back
 * button returns to the exact scroll position on the single page.
 */
test.describe('case study routes', () => {
  test('deep link renders the study with its meta head', async ({ page }) => {
    await page.goto('/ai/transformer-italian-corpus');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'A transformer on an Italian-language corpus',
    );
    await expect(page).toHaveTitle(/A transformer on an Italian-language corpus/);
    await expect(page.getByRole('link', { name: /Back to the ascent/ })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Problem' })).toBeVisible();
  });

  test('unknown slug lands on the 404 in voice', async ({ page }) => {
    await page.goto('/ai/does-not-exist');

    await expect(page.getByRole('heading', { name: 'Lost altitude.' })).toBeVisible();
    await expect(page).toHaveTitle(/Lost altitude/);
  });

  test('back navigation returns to the exact scroll position (ADR-0005)', async ({ page }) => {
    await page.goto('/');

    // Anchor the depth to the tile itself, not a magic number: the bands above
    // the mosaic grow with content (Phase 5), so a fixed offset would land on
    // different sections per breakpoint — and Playwright's actionability
    // scroll would silently change the position the back button must restore.
    const tile = page.getByRole('link', { name: /AI & Physics/ });
    await tile.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, Math.max(0, window.scrollY - 150)));
    await page.waitForTimeout(150);
    const before = await page.evaluate(() => window.scrollY);
    expect(before).toBeGreaterThan(200);

    await tile.click();
    await expect(page).toHaveURL(/\/ai\/transformer-italian-corpus$/);

    await page.goBack();
    await expect(page).toHaveURL('/');
    await page.waitForTimeout(250);

    const after = await page.evaluate(() => window.scrollY);
    expect(Math.abs(after - before)).toBeLessThan(Math.max(100, before * 0.15));
  });
});
