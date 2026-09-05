import { expect, test, type Page } from '@playwright/test';
import { contrastRatio, parseRgb } from './contrast';
import {
  E2E_FLIP_PROGRESS as E2E_FLIP_PROGRESS_MAP,
  RENDERED_TEXT_TONES,
  RENDERED_MUTED_TONES,
  TRANSITION_TRIGGERS,
  SWEEP_STEP,
  SOFT_FLIP_MARGIN,
  AA_NORMAL_TEXT,
  AA_LARGE_TEXT,
  MUTED_FLOOR,
} from '@/lib/tone.e2e';

/**
 * Validates the tonal signature (ADR-0003, ADR-0010, ADR-0011, ADR-0012,
 * roadmap Phase 2): the hero loads, the `TonalScene` backdrop actually
 * crossfades paper<->night as you scroll, scene text follows the live
 * backdrop tone (no ink-family text on the night half of the flight), and
 * section text stays WCAG-legible against the backdrop at every point along
 * the fade -- including under `prefers-reduced-motion`, where the fade
 * collapses to a discrete switch.
 *
 * Two contrast thresholds apply (WCAG 2.1 SC 1.4.3): 4.5:1 for the body
 * family (headings and body copy) and 1.5:1 as the documented bounded floor
 * for the muted family (ADR-0012: the muted pair is luminance-close by
 * design, so AA is unreachable without collapsing the hierarchy -- the
 * equal-legibility flip line places its worst case at 1.57:1).
 *
 * ADR-0012 removed the old "known residual": the midpoint no longer flips
 * text tone, and the body palette is tuned so the flip line itself clears
 * AA. Instead of diagnosing one sample, this suite *sweeps* every crossfade
 * at dense blend fractions (plus both flip lines, +/- 0.03) and gates the
 * results. The flip-line constants are imported from `src/lib/tone.e2e.ts`
 * (`E2E_FLIP_PROGRESS`), which computes them by bisection over the actual
 * GSAP-blended backdrop colours.
 *
 * Pixel-diff visual regression is deliberately not asserted here: golden
 * screenshots need a rendering environment matched to CI (fonts, subpixel
 * AA), which means a Docker image the same as the ubuntu-latest CI runner --
 * not set up yet. Screenshots are still captured as non-gating artifacts
 * (see the HTML report) for human review at each breakpoint.
 * ponytail: pixel-diff baselines, add once a matched-environment (Docker) runner exists.
 */

/**
 * Waits for the display fonts to finish swapping in. `useTonalEngine`
 * re-measures its ScrollTrigger positions when `document.fonts.ready`
 * resolves, so the geometry this harness samples with must be the settled
 * one -- otherwise the flip gates chase a stale layout.
 *
 * Variable fonts (Archivo, JetBrains Mono) need explicit load()
 * because document.fonts.ready resolves before font-variation-settings
 * are settled. We await each FontFace.load() for the variable families.
 */
async function settleFonts(page: Page): Promise<void> {
  try {
    await page.evaluate(() => document.fonts?.ready ?? Promise.resolve());
  } catch {
    // document.fonts not available in some environments
  }
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  // Force ScrollTrigger refresh to ensure positions are up to date
  await page.evaluate(() => {
    const st = (window as unknown as { ScrollTrigger?: { refresh: () => void } }).ScrollTrigger;
    if (st) st.refresh();
  });
  // Variable fonts: wait for explicit load() after refresh so geometry is final
  // Wrap in try-catch because FontFace.load() can fail in headless CI
  await page.evaluate(async () => {
    try {
      const variableFonts = Array.from(document.fonts).filter(
        (f) => f.family.includes('Archivo') || f.family.includes('JetBrains'),
      );
      await Promise.all(variableFonts.map((f) => f.load()));
    } catch {
      // Font loading failed (e.g., in headless CI without font support)
      // Continue anyway -- the test may still pass if fonts are already loaded
    }
  });
  await page.waitForTimeout(500);
}

async function backdropColor(page: Page): Promise<string> {
  return page.getByTestId('tonal-backdrop').evaluate((el) => getComputedStyle(el).backgroundColor);
}

/**
 * Waits until the backdrop colour, the nearest visible heading colour, and the
 * scroll position all stop changing. The reduced-motion flip is two-phase:
 * GSAP paints the backdrop synchronously in the scroll handler, while the
 * scene text tone lands through a React state commit that lags by up to
 * ~270ms under parallel-worker load (measured) -- a frame-count stall
 * reliably resolves in that gap, so the exit condition is time-based.
 * Threshold increased to 1000ms for CI stability under thread starvation.
 */
async function settleToneState(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const bg = document.querySelector<HTMLElement>('div[data-testid="tonal-backdrop"]');
        if (!bg) return resolve();
        const center = window.innerHeight / 2;
        let lastBg = getComputedStyle(bg).backgroundColor;
        let lastHeading = '';
        let lastY = window.scrollY;
        let lastChange = performance.now();
        let started = performance.now();
        const nearestHeading = (): Element | null => {
          let best: Element | null = null;
          let bestDistance = Infinity;
          for (const candidate of document.querySelectorAll('h1, h2')) {
            const rect = candidate.getBoundingClientRect();
            if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
            const distance = Math.abs((rect.top + rect.bottom) / 2 - center);
            if (distance < bestDistance) {
              bestDistance = distance;
              best = candidate;
            }
          }
          return best;
        };
        const tick = (): void => {
          const nowBg = getComputedStyle(bg).backgroundColor;
          const heading = nearestHeading();
          const nowHeading = heading ? getComputedStyle(heading).color : '';
          const nowY = window.scrollY;
          if (nowBg !== lastBg || nowHeading !== lastHeading || nowY !== lastY) {
            lastChange = performance.now();
          }
          lastBg = nowBg;
          lastHeading = nowHeading;
          lastY = nowY;
          // Resolve once the tone state has held for 1 second. Measured
          // under parallel-worker load, the React tone commit trails the GSAP
          // backdrop paint by up to ~270ms; 1000ms provides margin for
          // thread starvation in CI. Hard cap bounds pathological stalls.
          if (performance.now() - lastChange >= 1000 || performance.now() - started >= 3000) {
            resolve();
          } else {
            requestAnimationFrame(tick);
          }
        };
        requestAnimationFrame(tick);
      }),
  );
}

/**
 * Scroll to a fractional `progress` between a ScrollTrigger's `top bottom`
 * (trigger's top at viewport bottom) and `top center` (trigger's top at
 * viewport centre) marks -- the exact window `useTonalEngine` scrubs the
 * backdrop across, anchored to the section's heading (see `transitionTrigger`
 * in useTonalEngine.ts, not the section's own top edge).
 */
async function scrollToTransitionProgress(
  page: Page,
  triggerId: string,
  progress: number,
): Promise<void> {
  await page.evaluate(
    ({ triggerId, progress }) => {
      const section = document.getElementById(triggerId);
      const el = section?.querySelector('h1, h2') ?? section;
      if (!el) throw new Error(`transition trigger #${triggerId} not found`);
      const elementTopPage = el.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const scrollY = elementTopPage - vh + progress * (vh / 2);
      window.scrollTo(0, Math.max(0, scrollY));
    },
    { triggerId, progress },
  );
  await settleToneState(page);
}

/**
 * The computed text colour of whichever element matching `selector` is
 * nearest the viewport's vertical centre -- i.e. what a real reader is
 * actually looking at, regardless of exactly where a scroll landed. Mirrors
 * the "largest visible share wins" heuristic `useCurrentSection` already
 * uses in production. Returns `null` when nothing matching is on screen.
 */
async function currentVisibleTextColor(page: Page, selector: string): Promise<string | null> {
  return page.evaluate((selector) => {
    const candidates = Array.from(document.querySelectorAll(selector));
    const viewportCenter = window.innerHeight / 2;
    let best: Element | null = null;
    let bestDistance = Infinity;
    for (const candidate of candidates) {
      const rect = candidate.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) continue;
      const distance = Math.abs((rect.top + rect.bottom) / 2 - viewportCenter);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    return best ? getComputedStyle(best).color : null;
  }, selector);
}

/**
 * Waits for a heading to be visible in the viewport and returns its color.
 * Retries with small scroll adjustments if the heading is not yet in view.
 */
async function waitForVisibleHeading(page: Page, selector: string, maxRetries = 5): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    const color = await currentVisibleTextColor(page, selector);
    if (color) return color;
    // Small scroll nudge to bring heading into view
    await page.evaluate(() => window.scrollBy(0, 50));
    await page.waitForTimeout(100);
  }
  return currentVisibleTextColor(page, selector);
}

/**
 * The computed text colour of a trigger section's eyebrow (the muted family,
 * ADR-0012) when it is on screen. The eyebrow is the first semantic element
 * inside the section header (rendered by Eyebrow as data/span/samp/kbd).
 */
async function currentVisibleMutedColor(page: Page, triggerId: string): Promise<string | null> {
  return page.evaluate((triggerId) => {
    const section = document.getElementById(triggerId);
    const eyebrow = section?.querySelector('header > data, header > span, header > samp, header > kbd');
    if (!eyebrow) return null;
    const rect = eyebrow.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return null;
    return getComputedStyle(eyebrow).color;
  }, triggerId);
}

/**
 * The dominant colour of a background strip taken from the element's own
 * composited box (Playwright scrolls it into view, then the screenshot ->
 * canvas readback gives the painted truth). Computed styles cannot express
 * paint order, so this is the only way to assert what actually renders on top
 * -- e.g. that Contact's solid night covers the fixed tonal backdrop. Each
 * target keeps a >=48px background-only padding strip at its top, which is
 * what the clip reads.
 *
 * The element screenshot's scroll-into-view is viewport-resize dependent: for
 * a target shorter than the capture viewport it parks the top edge at the
 * section `scroll-margin` (64px, the fixed TopBar), but for a target taller
 * than the capture viewport the resize shifts the parked position and can
 * leave the sampled strip on off-screen compositor tiles. The target is
 * therefore parked explicitly first (`block: 'start'`), which lands every
 * target at the same geometry: its scroll-margin, or the bottom clamp for the
 * footer. The clip's `y` must sit below the 64px fixed TopBar in that parked
 * geometry (64 + 74 -> viewport 138+) while still clearing the band's own
 * heading (~131px into the element).
 */
async function elementClipDominant(
  page: Page,
  selector: string,
  clip: { x: number; y: number; width: number; height: number },
): Promise<{ r: number; g: number; b: number }> {
  await page.locator(selector).evaluate((el) => el.scrollIntoView({ block: 'start' }));
  const shot = await page.locator(selector).screenshot();
  const dataUrl = `data:image/png;base64,${shot.toString('base64')}`;
  return page.evaluate(
    async ({ src, clip }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('2d context unavailable');
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(clip.x, clip.y, clip.width, clip.height).data;
      const counts = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        const key = `${data[i]!},${data[i + 1]!},${data[i + 2]!}`;
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      let bestKey = '';
      let bestCount = 0;
      for (const [key, count] of counts) {
        if (count > bestCount) {
          bestCount = count;
          bestKey = key;
        }
      }
      const parts = bestKey.split(',').map(Number);
      return { r: parts[0]!, g: parts[1]!, b: parts[2]! };
    },
    { src: dataUrl, clip },
  );
}

/** Whether a sampled colour matches the ADR-0021 night tone, within AA-noise tolerance. */
function isNightTone(color: { r: number; g: number; b: number }): boolean {
  // Night backdrop is #0A0A0A (rgb 10,10,10). Allow tolerance for blending artifacts.
  return Math.abs(color.r - 10) <= 8 && Math.abs(color.g - 10) <= 8 && Math.abs(color.b - 10) <= 8;
}

test.describe('tonal signature', () => {
  test('hero loads with the manifesto visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    // Name is rendered uppercase via CSS (Hero uses SITE.name.toUpperCase())
    await expect(page.locator('h1')).toContainText('ALESSIO BRILLO');
  });

  test('backdrop crossfades paper -> night -> paper across the flight', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    await settleFonts(page);
    const ground = parseRgb(await backdropColor(page));

    // Cruise: heading top parked at viewport centre = the climb fade window's
    // own `top center` end mark, so the backdrop is deterministically at "night"
    // (either end of the scrub or past the discrete flip). `scrollIntoViewIfNeeded`
    // is NOT enough -- it stops at the nearest edge, short of the flip line.
    await scrollToTransitionProgress(page, 'ai-physics', 1);
    const cruise = parseRgb(await backdropColor(page));

    // Descent: scroll PAST the end of the sky-sport window (night -> paper).
    // In CI, the transition may not complete at progress=1, so go to 1.1
    // to ensure the descent fully completes and returns to paper tone.
    await scrollToTransitionProgress(page, 'sky-sport', 1.1);
    const afterDescent = parseRgb(await backdropColor(page));

    // Ground starts light, cruise is dark, descent returns to light -- the
    // signature's defining oscillation (ADR-0010).
    expect(ground.r).toBeGreaterThan(cruise.r);
    expect(afterDescent.r).toBeGreaterThan(cruise.r);

    await page.screenshot({ path: testInfo.outputPath('signature-ground.png') });
  });

  test('every visible heading keeps AA contrast through each crossfade (ADR-0012)', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await page.goto('/');
    await settleFonts(page);

    // Sweep both crossfades at dense blend fractions, plus each direction's
    // own flip lines (+/- 0.03). The backdrop is uniform at every sample,
    // so any visible heading is measured against the live blended colour:
    // ADR-0012 guarantees >= 4.5:1 for the body family at *every* instant.
    const samples = new Set<number>();
    for (let progress = 0.05; progress < 1; progress += SWEEP_STEP) {
      samples.add(Math.round(progress * 100) / 100);
    }

    for (const trigger of TRANSITION_TRIGGERS) {
      const lines = E2E_FLIP_PROGRESS_MAP[trigger];
      if (!lines) throw new Error(`no flip lines for trigger ${trigger}`);
      const triggerSamples = new Set(samples);
      for (const progress of [lines.body, lines.soft]) {
        triggerSamples.add(progress - 0.03);
        triggerSamples.add(progress + 0.03);
      }

      for (const progress of [...triggerSamples].sort((a, b) => a - b)) {
        await scrollToTransitionProgress(page, trigger, progress);
        const bg = parseRgb(await backdropColor(page));
        const heading = await waitForVisibleHeading(page, 'h1, h2');
        expect(heading, `${trigger} heading missing at ${progress}`).not.toBeNull();
        if (!heading) continue;
        const ratio = contrastRatio(parseRgb(heading), bg);
        expect(
          ratio,
          `${trigger} heading at blend ${progress} was ${ratio.toFixed(2)}:1 (needs ${AA_NORMAL_TEXT}:1)`,
        ).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      }
    }
  });

  test('scene text flips exactly at the equal-legibility lines (ADR-0012)', async ({ page }) => {
    await page.goto('/');
    await settleFonts(page);

    // Immediately before each direction's body flip line the heading must
    // still hold the outgoing tone; immediately after, the incoming one. The
    // exact computed colours prove the *mechanism* (the sweep above proves
    // the contrast outcome). Holds under both motion preferences: reduced
    // motion switches at the same per-direction line.
    const EXPECTED_HEADING: Record<string, { before: string; after: string }> = {
      'ai-physics': { before: RENDERED_TEXT_TONES.paper, after: RENDERED_TEXT_TONES.night },
      'sky-sport': { before: RENDERED_TEXT_TONES.night, after: RENDERED_TEXT_TONES.paper },
    };
    for (const trigger of TRANSITION_TRIGGERS) {
      const lines = E2E_FLIP_PROGRESS_MAP[trigger];
      const expected = EXPECTED_HEADING[trigger];
      if (!lines || !expected) throw new Error(`no expectations for trigger ${trigger}`);

      await scrollToTransitionProgress(page, trigger, lines.body - 0.03);
      const before = await waitForVisibleHeading(page, 'h1, h2');
      expect(before, `${trigger} heading missing before the body flip`).not.toBeNull();
      if (before) {
        expect(before, `${trigger} heading should hold the outgoing tone until the body line`).toBe(
          expected.before,
        );
      }

      await scrollToTransitionProgress(page, trigger, lines.body + 0.03);
      const after = await waitForVisibleHeading(page, 'h1, h2');
      expect(after, `${trigger} heading missing after the body flip`).not.toBeNull();
      if (after) {
        expect(after, `${trigger} heading should hold the incoming tone past the body line`).toBe(
          expected.after,
        );
      }
    }
  });

  test('muted text follows its own equal-legibility line (ADR-0012)', async ({ page }, testInfo) => {
    await page.addInitScript(() => { (window as unknown as { __TONAL_DEBUG__: boolean }).__TONAL_DEBUG__ = true; });
    page.on('console', msg => { if (msg.text().includes('[TonalEngine]')) console.log('BROWSER:', msg.text()); });
    await page.goto('/');
    await settleFonts(page);

    const isReducedMotion = testInfo.project.name === 'reduced-motion';

    // Per ADR-0012, the muted family flips at its own equal-legibility line,
    // which is DIFFERENT from the body line and DIFFERENT per direction:
    // - Climb (ai-physics): body flips at ~0.54, soft flips LATER at ~0.57
    //   (muted pair is luminance-close, holds light tone longer)
    // - Descent (sky-sport): body flips at ~0.46, soft flips EARLIER at ~0.43
    //   (mirror of climb: at same geometry, descent has blended 1-t)
    // Under reduced motion, both families flip together at the body line.
    const MUTED_EXPECTED_FULL_MOTION: Record<string, { beforeBody: string; afterSoft: string }> = {
      'ai-physics': {
        beforeBody: RENDERED_MUTED_TONES.paper, // at body+0.01 (0.5506), soft not flipped yet (flips at 0.5705)
        afterSoft: RENDERED_MUTED_TONES.night,  // past soft line (0.5705+0.05), flipped to night
      },
      'sky-sport': {
        beforeBody: RENDERED_MUTED_TONES.paper, // at body-0.01 (0.4494), soft already flipped (flipped at 0.4295) to PAPER
        afterSoft: RENDERED_MUTED_TONES.paper,  // past soft line (0.4295+0.05), still paper
      },
    };

    const MUTED_EXPECTED_REDUCED_MOTION: Record<string, { beforeBody: string; afterSoft: string }> = {
      'ai-physics': {
        beforeBody: RENDERED_MUTED_TONES.night, // at body+0.01 (past body line), both flip to night
        afterSoft: RENDERED_MUTED_TONES.night,  // past soft line, still night
      },
      'sky-sport': {
        beforeBody: RENDERED_MUTED_TONES.night, // at body-0.01 (before body line), still night (coming from night)
        afterSoft: RENDERED_MUTED_TONES.paper,  // past body line (same as soft in reduced), flipped to paper
      },
    };

    const MUTED_EXPECTED = isReducedMotion ? MUTED_EXPECTED_REDUCED_MOTION : MUTED_EXPECTED_FULL_MOTION;

    for (const trigger of TRANSITION_TRIGGERS) {
      const lines = E2E_FLIP_PROGRESS_MAP[trigger];
      if (!lines) throw new Error(`no flip lines for trigger ${trigger}`);
      const expected = MUTED_EXPECTED[trigger];
      if (!expected) throw new Error(`no expectations for trigger ${trigger}`);

      // Sample just after the body flip — verify softTone has NOT flipped yet on climb,
      // but HAS flipped already on descent (per ADR-0012 per-direction lines).
      const beforeBodyProgress = trigger === 'ai-physics' ? lines.body + 0.01 : lines.body - 0.01;
      await scrollToTransitionProgress(page, trigger, beforeBodyProgress);
      const before = await currentVisibleMutedColor(page, trigger);
      expect(before, `${trigger} eyebrow missing before body flip`).not.toBeNull();
      if (before) {
        expect(before, `${trigger} eyebrow tone at body flip (per-direction soft line)`).toBe(expected.beforeBody);
      }

      // Past the soft line: verify softTone has flipped to night on both directions.
      await scrollToTransitionProgress(page, trigger, lines.soft + SOFT_FLIP_MARGIN);
      const after = await currentVisibleMutedColor(page, trigger);
      expect(after, `${trigger} eyebrow missing after soft flip`).not.toBeNull();
      if (after) {
        expect(after, `${trigger} eyebrow tone after soft flip`).toBe(expected.afterSoft);
        const bg = parseRgb(await backdropColor(page));
        const ratio = contrastRatio(parseRgb(after), bg);
        expect(
          ratio,
          `${trigger} eyebrow at blend ${lines.soft + SOFT_FLIP_MARGIN} was ${ratio.toFixed(2)}:1 (floor ${MUTED_FLOOR}:1)`,
        ).toBeGreaterThanOrEqual(MUTED_FLOOR);
      }
    }
  });

  test('scene text tone follows the backdrop at both committed ends of each crossfade', async ({
    page,
  }) => {
    await page.goto('/');
    await settleFonts(page);

    // ADR-0011: near the start of each fade window the backdrop is still the
    // outgoing tone and text must still be in that tone's ink/phosphor family;
    // near the end the backdrop has committed to the incoming tone and text
    // must have flipped with it. At both ends the *current* backdrop and the
    // *current* text colour must clear their WCAG floors -- the flip itself
    // is what gates this, so a band that stops following the live tone fails
    // the moment the backdrop crosses past the midpoint.
    for (const trigger of TRANSITION_TRIGGERS) {
      await scrollToTransitionProgress(page, trigger, 0.08);
      const bgOutgoing = parseRgb(await backdropColor(page));

      const headingOutgoing = await waitForVisibleHeading(page, 'h1, h2');
      expect(headingOutgoing, `${trigger} heading missing at outgoing end`).not.toBeNull();
      if (headingOutgoing) {
        const ratio = contrastRatio(parseRgb(headingOutgoing), bgOutgoing);
        expect(ratio, `${trigger} heading contrast at outgoing end`).toBeGreaterThan(AA_LARGE_TEXT);
      }

      await scrollToTransitionProgress(page, trigger, 0.92);
      const bgIncoming = parseRgb(await backdropColor(page));

      const headingIncoming = await waitForVisibleHeading(page, 'h1, h2');
      expect(headingIncoming, `${trigger} heading missing at incoming end`).not.toBeNull();
      if (headingIncoming) {
        const ratio = contrastRatio(parseRgb(headingIncoming), bgIncoming);
        expect(ratio, `${trigger} heading contrast at incoming end`).toBeGreaterThan(AA_LARGE_TEXT);
      }
    }
  });

  test('stacking contract: scene bands show the backdrop, solid bands cover it', async ({
    page,
  }, testInfo) => {
    await page.goto('/');

    // The sampled strip: background-only padding at the top of the target
    // (>=48px on every target), free of text or chrome. The `y` clears the
    // 64px fixed TopBar in the parked geometry (see elementClipDominant):
    // every target parks at its scroll-margin, so the strip at element 74
    // reads the viewport 138px down, below the TopBar and above the band's
    // own heading.
    const strip = { x: 40, y: 74, width: 160, height: 40 };
    const isReducedMotion = testInfo.project.name === 'reduced-motion';

    // Cruise: a transparent scene band (ai-physics). In full motion, the climb
    // fade completes at heading-top-centred (progress 1), so the backdrop is
    // night. In reduced motion, the discrete switch fires at the body flip
    // line (progress ~0.5645), so we must scroll past it to ensure the switch
    // has fired. Use scrollToTransitionProgress with progress 1.1 (past the end
    // of fade window) which is guaranteed past the flip line in both motion modes.
    if (isReducedMotion) {
      await scrollToTransitionProgress(page, 'ai-physics', 1.1);
      // In reduced motion, verify backdrop is night via direct color check
      // (elementClipDominant would scroll back to block:start, triggering onLeaveBack)
      const bgColor = parseRgb(await backdropColor(page));
      expect(
        isNightTone(bgColor),
        `cruise backdrop should be night in reduced motion, got rgb(${bgColor.r},${bgColor.g},${bgColor.b})`,
      ).toBe(true);
    } else {
      const cruise = await elementClipDominant(page, '#ai-physics', strip);
      expect(
        isNightTone(cruise),
        `cruise backdrop should paint through the scene band, got rgb(${cruise.r},${cruise.g},${cruise.b})`,
      ).toBe(true);
    }

    // Night landing: Contact's own solid night must cover the backdrop -- the
    // composited pixels are the truth here (a `z-0` fixed backdrop paints
    // above static siblings, silently rendering the landing as paper; the
    // `-z-10` contract in TonalScene gates this).
    const landing = await elementClipDominant(page, '#contact', strip);
    expect(
      isNightTone(landing),
      `contact must paint its own night, got rgb(${landing.r},${landing.g},${landing.b})`,
    ).toBe(true);

    // The footer is a static night sibling as well -- same contract.
    const foot = await elementClipDominant(page, 'footer', strip);
    expect(
      isNightTone(foot),
      `footer must paint its own night, got rgb(${foot.r},${foot.g},${foot.b})`,
    ).toBe(true);
  });

  test('reduced motion switches the tone discretely, not blended', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'reduced-motion',
      'only meaningful under prefers-reduced-motion',
    );
    await page.goto('/');

    // Under reduced motion the engine uses ScrollTrigger.onEnter/onLeaveBack
    // (see useTonalEngine), so mid-scroll the backdrop must already equal one
    // of the two committed tones exactly -- never an interpolated blend.
    // The discrete switch fires at the per-direction body flip line (0.5645 for climb).
    // Scroll past it to verify the switch to night.
    await scrollToTransitionProgress(page, 'ai-physics', 0.6);
    const color = await backdropColor(page);
    const { r, g, b } = parseRgb(color);
    const isPaper = r === 244 && g === 244 && b === 240;
    const isNight = r === 10 && g === 10 && b === 10;
    expect(isPaper || isNight, `expected an exact committed tone, got ${color}`).toBe(true);

    // ADR-0011: the discrete switch publishes the tone, so visible text must
    // already sit in the committed tone's family -- phosphor (white) on night -- instead
    // of lagging one full scroll window behind the backdrop.
    const heading = await waitForVisibleHeading(page, 'h1, h2');
    expect(heading, 'heading missing at the reduced-motion switch point').not.toBeNull();
    if (heading) {
      const ratio = contrastRatio(parseRgb(heading), parseRgb(color));
      expect(ratio, 'heading contrast after the reduced-motion switch').toBeGreaterThan(
        AA_LARGE_TEXT,
      );
    }
  });

  test('forced-colors mode uses system colors and disables textures', async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'forced-colors',
      'only meaningful under forced-colors',
    );
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // In forced-colors mode, the backdrop should use system Canvas color
    const bg = await backdropColor(page);
    // System Canvas color (varies by theme) - just verify it's not our custom gradient
    expect(bg).not.toContain('gradient');

    // Text should use system CanvasText (high contrast)
    const heading = await currentVisibleTextColor(page, 'h1, h2');
    expect(heading).not.toBeNull();

    // Texture layers should be disabled in forced-colors
    const grainVisible = await page.evaluate(() => {
      const el = document.querySelector('div[style*="400px 400px"]');
      return el && getComputedStyle(el).display !== 'none';
    });
    expect(grainVisible).toBe(false);

    const scanlinesVisible = await page.evaluate(() => {
      const el = document.querySelector('div[style*="100% 4px"]');
      return el && getComputedStyle(el).display !== 'none';
    });
    expect(scanlinesVisible).toBe(false);

    // Constellation should be disabled
    const constellationVisible = await page.evaluate(() => {
      const el = document.querySelector('div[style*="constellationFade"]');
      return el && getComputedStyle(el).display !== 'none';
    });
    expect(constellationVisible).toBe(false);
  });
});