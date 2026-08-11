import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { TONE, TONAL_TRANSITIONS, type ToneName } from '@/lib/tone';

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
 * The scroll position at which a scene band's text tone should flip while the
 * backdrop is *blending* (full-motion path, ADR-0011): the mathematical
 * midpoint of the fade window, where the backdrop is exactly equidistant from
 * the two committed tones (`top bottom` = heading top at 100% of the viewport,
 * `top center` = 50%, so the midpoint sits at 75%). From that point on the
 * incoming tone is strictly more legible than the outgoing one; flipping there
 * bounds each tone's sub-AA stretch to half the fade instead of sustaining it
 * for the whole crossfade.
 *
 * The flip is anchored as a *relative* start (`top 75%` of the trigger
 * heading). Relative positions are re-measured by ScrollTrigger on every
 * refresh, so they self-heal after fonts or images shift the layout -- an
 * absolute pixel start would freeze first-render geometry and fire the flip
 * late (the exact defect this anchor avoids).
 */
const FADE_MIDPOINT_START = 'top 75%';

export function useTonalEngine(
  backdropRef: RefObject<HTMLDivElement | null>,
  onToneChange?: (tone: ToneName) => void,
): void {
  // Kept in a ref so the GSAP effect only depends on the backdrop element:
  // `TonalScene` passes the stable `setTone` state setter, and re-running the
  // whole engine setup on every render would rebuild every ScrollTrigger.
  const onToneChangeRef = useRef(onToneChange);
  onToneChangeRef.current = onToneChange;

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

              // Text tone flip: at the fade midpoint the incoming tone becomes
              // the strictly more legible choice (ADR-0011), so scene bands
              // switch their text colour there -- an instant, scroll-linked
              // change (no CSS transition: both tones are exactly equally
              // legible at that line, and a time-based smooth would lag the
              // scroll-linked backdrop under fast scrolling).
              ScrollTrigger.create({
                trigger,
                start: FADE_MIDPOINT_START,
                onEnter: () => onToneChangeRef.current?.(transition.to),
                onLeaveBack: () => onToneChangeRef.current?.(transition.from),
              });
            }
          });

          mm.add('(prefers-reduced-motion: reduce)', () => {
            for (const transition of TONAL_TRANSITIONS) {
              const trigger = transitionTrigger(transition.trigger);
              if (!trigger) continue;
              // Same anchor as the full-motion flip: under reduced motion the
              // backdrop switches at the same fade-midpoint line, so both
              // paths flip the backdrop and the scene text tone together.
              ScrollTrigger.create({
                trigger,
                start: FADE_MIDPOINT_START,
                onEnter: () => {
                  gsap.set(el, { backgroundColor: TONE[transition.to] });
                  onToneChangeRef.current?.(transition.to);
                },
                onLeaveBack: () => {
                  gsap.set(el, { backgroundColor: TONE[transition.from] });
                  onToneChangeRef.current?.(transition.from);
                },
              });
            }
          });
        }, el);

        revert = () => ctx.revert();
      } catch {
        // Silently ignore — GSAP may fail to load in test environments.
      }
    }

    void setup();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [backdropRef]);
}
