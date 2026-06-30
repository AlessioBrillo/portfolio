import { useEffect } from 'react';
import type { RefObject } from 'react';
import { TONE, TONAL_TRANSITIONS } from '@/lib/tone';

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
