import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
  flipLineFor,
  SOFT_TEXT_TONE,
  TEXT_TONE,
  TONE,
  TONAL_TRANSITIONS,
  type TonalTransition,
  type ToneName,
} from '@/lib/tone';

/** Debounce helper for resize refresh — avoids StormTrigger spam on resize. */
function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), wait);
  }) as T;
}

/**
 * The element a transition's `start`/`end` marks are measured against. A
 * section's own heading, not its outer `<section>`, is the actual content
 * whose legibility the crossfade must protect -- anchoring to the section
 * would let `--space-section`'s top padding push the heading well past the
 * point ScrollTrigger considers the fade "done", leaving it briefly on a
 * backdrop of the wrong tone. Falls back to the section itself if it somehow
 * has no heading.
 *
 * The heading is located through the explicit `data-tone-trigger` marker
 * (rendered by `SectionHeader`) rather than a bare tag query, so the fade
 * anchor survives heading wrappers, a change of heading level, or future
 * styling moves. The tag query remains as a fallback for sections that do not
 * render a `SectionHeader`.
 */
function transitionTrigger(sectionId: string): Element | null {
  const section = document.getElementById(sectionId);
  return (
    section?.querySelector('[data-tone-trigger]') ?? section?.querySelector('h1, h2') ?? section
  );
}

/**
 * The scroll position at which a scene text family flips while the backdrop
 * is *blending* (ADR-0012): the transition's own equal-legibility line,
 * computed by bisection over the actual GSAP-blended backdrop colours (see
 * `flipLineFor` in `src/lib/tone.ts`). The line is per transition -- the
 * climb and the descent run over the same window in opposite directions, so
 * at any shared geometry the backdrop has blended different amounts and a
 * single shared position would strand the outgoing tone below AA.
 *
 * Flip positions are *relative* starts (`top <pct>%` of the trigger heading).
 * Relative positions are re-measured by ScrollTrigger on every refresh, so
 * they self-heal after fonts or images shift the layout -- an absolute pixel
 * start would freeze first-render geometry and fire the flip late (the exact
 * defect this anchor avoids).
 */
function flipStart(
  textTone: Readonly<Record<ToneName, string>>,
  transition: TonalTransition,
): string {
  return flipLineFor(textTone, transition).position;
}

export function useTonalEngine(
  backdropRef: RefObject<HTMLDivElement | null>,
  onToneChange?: (tone: ToneName) => void,
  onSoftToneChange?: (tone: ToneName) => void,
): void {
  // Kept in a ref so the GSAP effect only depends on the backdrop element:
  // `TonalScene` passes the stable `setTone` state setter, and re-running the
  // whole engine setup on every render would rebuild every ScrollTrigger.
  const onToneChangeRef = useRef(onToneChange);
  onToneChangeRef.current = onToneChange;
  const onSoftToneChangeRef = useRef(onSoftToneChange);
  onSoftToneChangeRef.current = onSoftToneChange;

  useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    async function setup(): Promise<void> {
      try {
        const [gsapMod, stMod] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
        if (cancelled || el === null) return;
        const { gsap } = gsapMod;
        const { ScrollTrigger } = stMod;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          const mm = gsap.matchMedia();

          mm.add('(prefers-reduced-motion: no-preference)', () => {
            for (const transition of TONAL_TRANSITIONS) {
              const trigger = transitionTrigger(transition.trigger);
              if (!trigger) continue;
              gsap.fromTo(
                el,
                { backgroundColor: TONE[transition.from] },
                {
                  backgroundColor: TONE[transition.to],
                  ease: 'none',
                  immediateRender: false,
                  scrollTrigger: {
                    trigger,
                    start: transition.start,
                    end: transition.end,
                    scrub: true,
                  },
                },
              );

              // Body text flip: at the equal-legibility line the incoming
              // tone becomes the strictly more legible choice (ADR-0012), so
              // scene bands switch their primary text colour there -- an
              // instant, scroll-linked change (no CSS transition: both tones
              // are equally legible at that line, and a time-based smooth
              // would lag the scroll-linked backdrop under fast scrolling).
              ScrollTrigger.create({
                trigger,
                start: flipStart(TEXT_TONE, transition),
                onEnter: () => onToneChangeRef.current?.(transition.to),
                onLeaveBack: () => onToneChangeRef.current?.(transition.from),
              });

              // Muted text flip: its own equal-legibility line, which fires
              // later than the body line (the muted pair is luminance-close
              // by design, so it can hold the light tone longer). Worst case
              // at the line is the documented floor (~1.57:1, ADR-0012).
              ScrollTrigger.create({
                trigger,
                start: flipStart(SOFT_TEXT_TONE, transition),
                onEnter: () => onSoftToneChangeRef.current?.(transition.to),
                onLeaveBack: () => onSoftToneChangeRef.current?.(transition.from),
              });
            }
          });

          mm.add('(prefers-reduced-motion: reduce)', () => {
            for (const transition of TONAL_TRANSITIONS) {
              const trigger = transitionTrigger(transition.trigger);
              if (!trigger) continue;
              // Same anchor as the full-motion body flip: under reduced motion
              // the backdrop switches at the same equal-legibility line, so
              // both paths flip the backdrop and the scene text tone together.
              // Both text families flip here too: there is no blend to
              // equalise against, and a split between the lines would strand
              // one family on the wrong committed tone between them.
              ScrollTrigger.create({
                trigger,
                start: flipStart(TEXT_TONE, transition),
                onEnter: () => {
                  gsap.set(el, { backgroundColor: TONE[transition.to] });
                  onToneChangeRef.current?.(transition.to);
                  onSoftToneChangeRef.current?.(transition.to);
                },
                onLeaveBack: () => {
                  gsap.set(el, { backgroundColor: TONE[transition.from] });
                  onToneChangeRef.current?.(transition.from);
                  onSoftToneChangeRef.current?.(transition.from);
                },
              });
            }
          });
        }, el);

        // ScrollTrigger measures every start/end position at creation, but
        // the display fonts (Fraunces, Geist) swap in after the first paint
        // and shift every trigger below the hero by tens of pixels -- the
        // fade and the flip lines would fire at stale positions forever.
        // Re-measure once the fonts settle so the flips land on their true
        // equal-legibility geometry (the e2e harness gates this alignment).
        if (document.fonts) {
          void document.fonts.ready.then(() => {
            if (cancelled) return;
            ScrollTrigger.refresh();
          });
        }

        revert = () => ctx.revert();
      } catch (error) {
        // GSAP is a runtime enhancement: the seed `paper` backdrop and the
        // scene context's default `paper` tone keep every band AA-legible
        // even if the dynamic import fails, so the page degrades to the
        // ground tone instead of breaking. The failure is surfaced loudly
        // rather than swallowed -- a silent miss of the signature would be
        // far harder to debug.
        console.error(
          'Tonal engine: GSAP failed to load; the page stays on the paper tone.',
          error,
        );
      }
    }

    void setup();

    // Refresh ScrollTrigger after all assets (fonts, images, layout) have
    // settled. window.load fires after document.fonts.ready and image loads,
    // guaranteeing the geometry is final. Debounced resize handles viewport
    // changes (rotation, split-screen, devtools) that shift trigger positions.
    const debouncedRefresh = debounce(() => {
      if (!cancelled) ScrollTrigger.refresh();
    }, 150);

    window.addEventListener(
      'load',
      () => {
        if (!cancelled) ScrollTrigger.refresh();
      },
      { once: true },
    );

    window.addEventListener('resize', debouncedRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', debouncedRefresh);
      revert?.();
    };
  }, [backdropRef]);
}
