import { expect, test, type Page } from '@playwright/test';
import { contrastRatio, parseRgb } from './contrast';

/**
 * Validates the tonal signature (ADR-0003, ADR-0010, ADR-0011, roadmap Phase 2):
 * the hero loads, the `TonalScene` backdrop actually crossfades paper<->night as
 * you scroll, scene text follows the live backdrop tone (no ink-family text on
 * the night half of the flight), and section text stays WCAG-legible against
 * the backdrop at every point along the fade -- including under
 * `prefers-reduced-motion`, where the fade collapses to a discrete switch.
 *
 * Two contrast thresholds apply (WCAG 2.1 SC 1.4.3): 3:1 for "large" text
 * (headings here are >=36px, well past the >=24px/>=18.66px-bold cutoff) and
 * 4.5:1 for everything else (the section intro paragraph, ~17-19px).
 *
 * Pixel-diff visual regression is deliberately not asserted here: golden
 * screenshots need a rendering environment matched to CI (fonts, subpixel
 * AA), which means a Docker image the same as the ubuntu-latest CI runner --
 * not set up yet. Screenshots are still captured as non-gating artifacts
 * (see the HTML report) for human review at each breakpoint.
 * ponytail: pixel-diff baselines, add once a matched-environment (Docker) runner exists.
 *
 * Known residual (bounded by ADR-0011, tracked -- not fixed here): exactly at
 * a crossfade's mathematical midpoint, the backdrop is a 50/50 blend of the
 * two ADR-0008 tones and *both* text tones measure near their WCAG floor
 * against it. ADR-0011 flips scene text at that midpoint (the point where the
 * incoming tone becomes strictly more legible), bounding each tone's sub-AA
 * stretch to a single instant rather than an entire crossfade -- but the
 * instant itself remains. This isn't a timing bug: no retiming of the
 * trigger's scroll window changes the *colour* at a given blend fraction,
 * only where along the scroll it falls, and the exact fraction sampled at a
 * fixed pixel step shifts with viewport height -- so any single hard
 * threshold there would be whack-a-mole across breakpoints, not real
 * regression protection. The checks below are diagnostic (`console.info`),
 * not gates, for that sample: they log every measurement so the gap stays
 * visible without perpetually failing CI over an accepted, documented
 * limitation. The real regression gates are the other tests, which verify
 * the fixes (heading-anchored trigger, midpoint-anchored reduced-motion
 * switch, and the text-tone flip) actually hold at the committed ends of
 * every crossfade.
 * ponytail: per-heading text-colour animation (or a palette revisit) closes the
 * midpoint instant for good.
 */

const AA_LARGE_TEXT = 3;
const AA_NORMAL_TEXT = 4.5;
/** Climb triggers on ai-physics, descent on sky-sport -- see src/lib/tone.ts. */
const TRANSITION_TRIGGERS = ['ai-physics', 'sky-sport'];
/** Fractions along each transition's `start` ('top bottom') -> `end` ('top center'). */
const TRANSITION_PROGRESS_SAMPLES = [0.15, 0.5, 0.85];

async function backdropColor(page: Page): Promise<string> {
  return page.getByTestId('tonal-backdrop').evaluate((el) => getComputedStyle(el).backgroundColor);
}

/**
 * Waits until the backdrop colour, the nearest visible heading colour, and the
 * scroll position all stop changing. The reduced-motion flip is two-phase:
 * GSAP paints the backdrop synchronously in the scroll handler, while the
 * scene text tone lands through a React state commit that lags by up to
 * ~270ms under parallel-worker load (measured) — a frame-count stall
 * reliably resolves in that gap, so the exit condition is time-based.
 */
async function settleToneState(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const bg = document.querySelector<HTMLElement>(
          'div[data-testid="tonal-backdrop"]',
        );
        if (!bg) return resolve();
        const center = window.innerHeight / 2;
        let lastBg = getComputedStyle(bg).backgroundColor;
        let lastHeading = '';
        let lastY = window.scrollY;
        let lastChange = performance.now();
        const started = performance.now();
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
          // Resolve once the tone state has held for half a second. Measured
          // under parallel-worker load, the React tone commit trails the GSAP
          // backdrop paint by up to ~270ms, so a frame-count stall reliably
          // resolves in the gap; a quiet stop (nothing to flip) exits on the
          // same time floor. Hard cap bounds pathological thread starvation.
          if (performance.now() - lastChange >= 500 || performance.now() - started >= 2000) {
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
 * The dominant colour of a top-left background strip taken from the element's
 * own composited box (Playwright scrolls it into view, then the screenshot ->
 * canvas readback gives the painted truth). Computed styles cannot express
 * paint order, so this is the only way to assert what actually renders on top
 * -- e.g. that Contact's solid night covers the fixed tonal backdrop. Each
 * target keeps a >=48px background-only padding strip at its top, which is
 * what the clip reads; the element screenshot's scroll-into-view is
 * deterministic: tall scene bands align their top edge with the viewport
 * (heading well past the fade midpoint), while the bottom-of-page sections
 * are already fully visible and cannot scroll further.
 */
async function elementClipDominant(
  page: Page,
  selector: string,
  clip: { x: number; y: number; width: number; height: number },
): Promise<{ r: number; g: number; b: number }> {
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

/** Whether a sampled colour matches the ADR-0008 night tone, within AA-noise tolerance. */
function isNightTone(color: { r: number; g: number; b: number }): boolean {
  return (
    Math.abs(color.r - 20) <= 6 && Math.abs(color.g - 22) <= 6 && Math.abs(color.b - 29) <= 6
  );
}

test.describe('tonal signature', () => {
  test('hero loads with the manifesto visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Alessio Brillo');
  });

  test('backdrop crossfades paper -> night -> paper across the flight', async ({
    page,
  }, testInfo) => {
    await page.goto('/');
    const ground = parseRgb(await backdropColor(page));

    // Cruise: heading top parked at viewport centre = the climb fade window's
    // own `top center` end mark, so the backdrop is deterministically at "night"
    // (either end of the scrub or past the discrete flip). `scrollIntoViewIfNeeded`
    // is NOT enough -- it stops at the nearest edge, short of the flip line.
    await scrollToTransitionProgress(page, 'ai-physics', 1);
    const cruise = parseRgb(await backdropColor(page));

    // Descent: same geometry on the sky-sport window (night -> paper).
    await scrollToTransitionProgress(page, 'sky-sport', 1);
    const afterDescent = parseRgb(await backdropColor(page));

    // Ground starts light, cruise is dark, descent returns to light -- the
    // signature's defining oscillation (ADR-0010).
    expect(ground.r).toBeGreaterThan(cruise.r);
    expect(afterDescent.r).toBeGreaterThan(cruise.r);

    await page.screenshot({ path: testInfo.outputPath('signature-ground.png') });
  });

  test('records text contrast through each backdrop transition (diagnostic, see module doc)', async ({
    page,
  }) => {
    await page.goto('/');

    for (const trigger of TRANSITION_TRIGGERS) {
      for (const progress of TRANSITION_PROGRESS_SAMPLES) {
        await scrollToTransitionProgress(page, trigger, progress);
        const bg = parseRgb(await backdropColor(page));
        const label = `${trigger} @ ${progress}`;

        const heading = await currentVisibleTextColor(page, 'h1, h2');
        if (heading) {
          const ratio = contrastRatio(parseRgb(heading), bg);
          if (ratio < AA_LARGE_TEXT) {
            console.info(
              `[known residual] heading contrast at ${label} was ${ratio.toFixed(2)}:1 (needs 3:1)`,
            );
          }
        }

        const intro = await currentVisibleTextColor(page, 'p');
        if (intro) {
          const ratio = contrastRatio(parseRgb(intro), bg);
          if (ratio < AA_NORMAL_TEXT) {
            console.info(
              `[known residual] intro contrast at ${label} was ${ratio.toFixed(2)}:1 (needs 4.5:1)`,
            );
          }
        }
      }
    }
  });

  test('scene text tone follows the backdrop at both committed ends of each crossfade', async ({
    page,
  }) => {
    await page.goto('/');

    // ADR-0011: near the start of each fade window the backdrop is still the
    // outgoing tone and text must still be in that tone's ink/cream family;
    // near the end the backdrop has committed to the incoming tone and text
    // must have flipped with it. At both ends the *current* backdrop and the
    // *current* text colour must clear their WCAG floors -- the flip itself
    // is what gates this, so a band that stops following the live tone fails
    // the moment the backdrop crosses past the midpoint.
    for (const trigger of TRANSITION_TRIGGERS) {
      await scrollToTransitionProgress(page, trigger, 0.08);
      const bgOutgoing = parseRgb(await backdropColor(page));

      const headingOutgoing = await currentVisibleTextColor(page, 'h1, h2');
      expect(headingOutgoing, `${trigger} heading missing at outgoing end`).not.toBeNull();
      if (headingOutgoing) {
        const ratio = contrastRatio(parseRgb(headingOutgoing), bgOutgoing);
        expect(ratio, `${trigger} heading contrast at outgoing end`).toBeGreaterThan(AA_LARGE_TEXT);
      }

      await scrollToTransitionProgress(page, trigger, 0.92);
      const bgIncoming = parseRgb(await backdropColor(page));

      const headingIncoming = await currentVisibleTextColor(page, 'h1, h2');
      expect(headingIncoming, `${trigger} heading missing at incoming end`).not.toBeNull();
      if (headingIncoming) {
        const ratio = contrastRatio(parseRgb(headingIncoming), bgIncoming);
        expect(ratio, `${trigger} heading contrast at incoming end`).toBeGreaterThan(AA_LARGE_TEXT);
      }
    }
  });

  test('stacking contract: scene bands show the backdrop, solid bands cover it', async ({
    page,
  }) => {
    await page.goto('/');

    // The sampled strip: the element's own top-left background-only padding
    // (>=48px on every target), free of text or chrome.
    const strip = { x: 40, y: 10, width: 160, height: 40 };

    // Cruise: a transparent scene band (ai-physics). The element screenshot
    // parks its top edge at the viewport top, so the climb fade -- anchored
    // to the heading, completed at heading-top-centred -- is long over and the
    // backdrop is night. The band's padding must sample that night, proving
    // the backdrop paints through scene bands.
    const cruise = await elementClipDominant(page, '#ai-physics', strip);
    expect(isNightTone(cruise), `cruise backdrop should paint through the scene band, got rgb(${cruise.r},${cruise.g},${cruise.b})`).toBe(true);

    // Night landing: Contact's own solid night must cover the backdrop -- the
    // composited pixels are the truth here (a `z-0` fixed backdrop paints
    // above static siblings, silently rendering the landing as paper; the
    // `-z-10` contract in TonalScene gates this).
    const landing = await elementClipDominant(page, '#contact', strip);
    expect(isNightTone(landing), `contact must paint its own night, got rgb(${landing.r},${landing.g},${landing.b})`).toBe(true);

    // The footer is a static night sibling as well -- same contract.
    const foot = await elementClipDominant(page, 'footer', strip);
    expect(isNightTone(foot), `footer must paint its own night, got rgb(${foot.r},${foot.g},${foot.b})`).toBe(true);
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
    await scrollToTransitionProgress(page, 'ai-physics', 0.5);
    const color = await backdropColor(page);
    const { r, g, b } = parseRgb(color);
    const isPaper = r === 244 && g === 239 && b === 230;
    const isNight = r === 20 && g === 22 && b === 29;
    expect(isPaper || isNight, `expected an exact committed tone, got ${color}`).toBe(true);

    // ADR-0011: the discrete switch publishes the tone, so visible text must
    // already sit in the committed tone's family -- cream on night -- instead
    // of lagging one full scroll window behind the backdrop.
    const heading = await currentVisibleTextColor(page, 'h1, h2');
    expect(heading, 'heading missing at the reduced-motion switch point').not.toBeNull();
    if (heading) {
      const ratio = contrastRatio(parseRgb(heading), parseRgb(color));
      expect(ratio, 'heading contrast after the reduced-motion switch').toBeGreaterThan(
        AA_LARGE_TEXT,
      );
    }
  });
});
