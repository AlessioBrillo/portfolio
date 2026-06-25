import { useEffect } from 'react';
import type { RefObject } from 'react';
import { TONE, TONAL_TRANSITIONS } from '@/lib/tone';

/**
 * The tonal engine. Drives the background colour of a fixed backdrop element
 * across the flight profile with GSAP ScrollTrigger — one scrubbed crossfade
 * per entry in `TONAL_TRANSITIONS`, each anchored to a real section element so
 * the timing follows the DOM, not a global scroll heuristic (ADR-0003).
 *
 * GSAP is imported dynamically to keep it out of the initial bundle (the
 * performance floor, ADR-0009). Under `prefers-reduced-motion: reduce` the
 * crossfades collapse to discrete switches with no scrubbing (ADR-0009).
 */
export function useTonalEngine(backdropRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;

    let cancelled = false;
    let revert: (() => void) | undefined;

    async function setup(): Promise<void> {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || el === null) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        // Full motion: scrub the crossfade to scroll position.
        mm.add('(prefers-reduced-motion: no-preference)', () => {
          for (const transition of TONAL_TRANSITIONS) {
            const trigger = document.getElementById(transition.trigger);
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

        // Reduced motion: switch tone discretely as the section reaches centre.
        mm.add('(prefers-reduced-motion: reduce)', () => {
          for (const transition of TONAL_TRANSITIONS) {
            const trigger = document.getElementById(transition.trigger);
            if (!trigger) continue;
            ScrollTrigger.create({
              trigger,
              start: 'top center',
              onEnter: () => gsap.set(el, { backgroundColor: TONE[transition.to] }),
              onLeaveBack: () => gsap.set(el, { backgroundColor: TONE[transition.from] }),
            });
          }
        });
      }, el);

      revert = () => ctx.revert();
    }

    void setup();

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [backdropRef]);
}
