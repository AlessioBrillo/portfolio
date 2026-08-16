import { expect, test } from '@playwright/test';
import { getCaseStudy, getPublishedCaseStudies } from '../src/content/case-studies/registry';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const PUBLISHED = getPublishedCaseStudies();

/**
 * Exercises the case-study surface that unit tests cannot reach in a browser
 * (ADR-0005): deep links resolve to the study with its route head, unknown
 * slugs fall to the 404 in voice, and — the pipeline's promise — the back
 * button returns to the exact scroll position on the single page. The deep
 * link and prev/next tests are driven by the registry, so a study added to
 * `PUBLISHED_ORDER` is covered without editing this file.
 */
test.describe('case study routes', () => {
  for (const study of PUBLISHED) {
    test(`deep link renders ${study.domain}/${study.slug} with its meta head`, async ({ page }) => {
      await page.goto(`/${study.domain}/${study.slug}`);

      await expect(page.getByRole('heading', { level: 1 })).toContainText(study.title);
      await expect(page).toHaveTitle(new RegExp(escapeRegExp(study.title)));
      await expect(page.getByRole('link', { name: /Back to the ascent/ })).toBeVisible();
      await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
    });
  }

  test('unknown slug lands on the 404 in voice', async ({ page }) => {
    await page.goto('/ai/does-not-exist');

    await expect(page.getByRole('heading', { name: 'Lost altitude.' })).toBeVisible();
    await expect(page).toHaveTitle(/Lost altitude/);
  });

  test('draft study renders by direct URL but stays out of published surfaces', async ({
    page,
  }) => {
    const draft = getCaseStudy('next-ai-physics');
    expect(draft).toBeDefined();

    await page.goto(`/${draft?.meta.domain}/${draft?.meta.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to the ascent/ })).toBeVisible();

    await page.goto('/');
    await expect(
      page.locator(`a[href="/${draft?.meta.domain}/${draft?.meta.slug}"]`),
    ).toHaveCount(0);
  });

  test('dev server carries no analytics beacon (ADR-0013 env gating)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[data-domain]')).toHaveCount(0);
  });

  test('prev/next navigation walks the curated order end to end', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'desktop-1440',
      'Viewport-independent DOM assertion; a single project suffices.',
    );
    const first = PUBLISHED[0];
    const last = PUBLISHED[PUBLISHED.length - 1];
    expect(first).toBeDefined();
    expect(last).toBeDefined();

    await page.goto(`/${first?.domain}/${first?.slug}`);
    for (const study of PUBLISHED.slice(1)) {
      await page.getByRole('link', { name: /Next study/ }).click();
      await expect(page).toHaveURL(
        new RegExp(`/${study.domain}/${escapeRegExp(study.slug)}$`),
      );
    }

    for (const study of [...PUBLISHED].reverse().slice(1)) {
      await page.getByRole('link', { name: /Previous study/ }).click();
      await expect(page).toHaveURL(
        new RegExp(`/${study.domain}/${escapeRegExp(study.slug)}$`),
      );
    }
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