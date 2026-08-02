import { useEffect } from 'react';
import type { RefObject } from 'react';
import { SECTION_ORDER } from '@/lib/altitude';
import { TONE, TONAL_TRANSITIONS } from '@/lib/tone';

/**
 * The element a transition's `start`/`end` marks are measured against. A
 * section's own heading, not its outer `<section>`, is the actual content
 * whose legibility the crossfade must protect -- anchoring to the section
 * would let `--space-section`'s top padding push the heading well past the
 * point ScrollTrigger considers the fade "done", leaving it briefly on a
 * backdrop of the wrong tone. Falls back to the section itself if it somehow
 * has no heading.
 */
function transitionTrigger(sectionId: string): Element | null {
  const section = document.getElementById(sectionId);
  return section?.querySelector('h1, h2') ?? section;
}

/** Absolute page Y of a section's own heading centre (falls back to the section itself). */
function headingCenterY(sectionId: string): number | null {
  const section = document.getElementById(sectionId);
  const target = section?.querySelector('h1, h2') ?? section;
  if (!target) return null;
  const rect = target.getBoundingClientRect();
  return rect.top + window.scrollY + rect.height / 2;
}

/**
 * The scroll position at which a discrete (reduced-motion) tone switch
 * should fire: the midpoint between the outgoing section's heading and the
 * incoming (trigger) section's heading. That midpoint is where "which
 * heading is nearest the viewport's centre" itself flips from outgoing to
 * incoming, so switching the backdrop there -- rather than at the incoming
 * heading's own centre -- keeps whichever heading is actually being read on
 * the matching tone.
 *
 * Measurements are deliberately taken inside the returned getter, not at
 * setup: ScrollTrigger re-resolves `start` on every refresh, so layout
 * shifts after mount (images, fonts) stay reflected instead of freezing
 * the switch points at first-render geometry.
 */
function discreteSwitchScrollY(triggerSectionId: string): (() => number) | null {
  if (headingCenterY(triggerSectionId) === null) return null;

  const index = SECTION_ORDER.indexOf(triggerSectionId as (typeof SECTION_ORDER)[number]);
  const previousId = index > 0 ? SECTION_ORDER[index - 1] : undefined;

  return () => {
    const incomingY = headingCenterY(triggerSectionId);
    const outgoingY = previousId ? headingCenterY(previousId) : null;
    if (incomingY === null) return window.scrollY;
    const midpointY = outgoingY !== null ? (incomingY + outgoingY) / 2 : incomingY;
    return midpointY - window.innerHeight / 2;
  };
}

export function useTonalEngine(backdropRef: RefObject<HTMLDivElement | null>): void {
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
            }
          });

          mm.add('(prefers-reduced-motion: reduce)', () => {
            for (const transition of TONAL_TRANSITIONS) {
              const start = discreteSwitchScrollY(transition.trigger);
              if (!start) continue;
              // No `trigger` element: `start` is already an absolute page
              // scroll position (the outgoing/incoming heading midpoint),
              // not a box measurement, so ScrollTrigger just watches the
              // scroller directly.
              ScrollTrigger.create({
                start,
                onEnter: () => gsap.set(el, { backgroundColor: TONE[transition.to] }),
                onLeaveBack: () => gsap.set(el, { backgroundColor: TONE[transition.from] }),
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
