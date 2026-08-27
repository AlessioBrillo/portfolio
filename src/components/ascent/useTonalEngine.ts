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

/** Type for ScrollTrigger — only the surface we actually use (`refresh()`, `getAll()`). */
type ScrollTriggerType = {
  refresh: () => void;
  getAll: () => Array<{ kill: () => void }>;
};

/**
 * Native debounce with proper cleanup — replaces custom implementation.
 * Uses setTimeout/clearTimeout with a ref to track the timer, ensuring
 * no memory leaks on unmount and correct trailing-edge behavior.
 */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const debounced = ((...args: unknown[]) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      fn(...args);
    }, wait);
  }) as T;
  // Attach cancel method for explicit cleanup
  (debounced as T & { cancel: () => void }).cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  return debounced;
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
 * Compute the ScrollTrigger start position string for a given text tone family
 * and transition (ADR-0012 equal-legibility line).
 */
function flipStart(
  textTone: Readonly<Record<ToneName, string>>,
  transition: TonalTransition,
): string {
  return flipLineFor(textTone, transition).position;
}

/**
 * Progress thresholds (0..1) for body and soft flips per transition.
 * Computed once at module load from the declared palette.
 */
const FLIP_PROGRESS: Record<string, { body: number; soft: number }> = (() => {
  const out: Record<string, { body: number; soft: number }> = {};
  for (const transition of TONAL_TRANSITIONS) {
    out[transition.trigger] = {
      body: flipLineFor(TEXT_TONE, transition).progress,
      soft: flipLineFor(SOFT_TEXT_TONE, transition).progress,
    };
  }
  return out;
})();

/** Detect reduced motion at runtime — avoids gsap.matchMedia flakiness. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useTonalEngine(
  backdropRef: RefObject<HTMLDivElement | null>,
  onToneChange?: (tone: ToneName) => void,
  onSoftToneChange?: (tone: ToneName) => void,
): void {
  const onToneChangeRef = useRef(onToneChange);
  onToneChangeRef.current = onToneChange;
  const onSoftToneChangeRef = useRef(onSoftToneChange);
  onSoftToneChangeRef.current = onSoftToneChange;

  const scrollTriggerRef = useRef<ScrollTriggerType | null>(null);
  // Track previous progress per transition trigger to detect line crossings
  // without relying on getVelocity() which returns px/s (incompatible with 0..1 progress).
  const prevProgressRef = useRef<Map<string, number>>(new Map());

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
        scrollTriggerRef.current = ScrollTrigger;

        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
          if (prefersReducedMotion()) {
            // Reduced motion: discrete switches at the per-direction body line.
            for (const transition of TONAL_TRANSITIONS) {
              const trigger = transitionTrigger(transition.trigger);
              if (!trigger) continue;
              const startPos = flipStart(TEXT_TONE, transition);
              ScrollTrigger.create({
                trigger,
                start: startPos,
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
          } else {
            // Full motion: single ScrollTrigger per transition with onUpdate for precise flips.
            for (const transition of TONAL_TRANSITIONS) {
              const trigger = transitionTrigger(transition.trigger);
              if (!trigger) continue;

              const lines = FLIP_PROGRESS[transition.trigger];
              if (!lines) continue;

              prevProgressRef.current.set(transition.trigger, -1);

              const tween = gsap.fromTo(
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
                    onUpdate: (self) => {
                      const progress = self.progress;
                      const prevProgress = prevProgressRef.current.get(transition.trigger) ?? -1;
                      prevProgressRef.current.set(transition.trigger, progress);

                      // Body flip: fire when crossing the body equal-legibility line
                      if (prevProgress < lines.body && progress >= lines.body) {
                        onToneChangeRef.current?.(transition.to);
                      } else if (prevProgress >= lines.body && progress < lines.body) {
                        onToneChangeRef.current?.(transition.from);
                      }

                      // Soft flip: fire when crossing the soft equal-legibility line
                      if (prevProgress < lines.soft && progress >= lines.soft) {
                        onSoftToneChangeRef.current?.(transition.to);
                      } else if (prevProgress >= lines.soft && progress < lines.soft) {
                        onSoftToneChangeRef.current?.(transition.from);
                      }
                    },
                  },
                },
              );

              void tween;
            }
          }
        }, el);

        if (document.fonts) {
          void document.fonts.ready.then(() => {
            if (cancelled) return;
            ScrollTrigger.refresh();
          });
        }

        revert = () => ctx.revert();
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Tonal engine: GSAP failed to load; applying degraded static gradient.', err);
        if (el && typeof window !== 'undefined') {
          // Degraded static gradient representing the flight profile:
          // paper (ground) -> night (cruise) -> paper (descent) -> night (contact)
          el.style.backgroundImage = `
            linear-gradient(
              to bottom,
              ${TONE.paper} 0%,
              ${TONE.paper} 25%,
              ${TONE.night} 25%,
              ${TONE.night} 50%,
              ${TONE.paper} 50%,
              ${TONE.paper} 75%,
              ${TONE.night} 75%,
              ${TONE.night} 100%
            )
          `
            .replace(/\s+/g, ' ')
            .trim();
          el.style.backgroundColor = 'transparent';
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('tonal-engine-error', {
              detail: { message: err.message, cause: err.cause, stack: err.stack },
            }),
          );
        }
      }
    }

    void setup();

    const refreshIfActive = (): void => {
      if (!cancelled && scrollTriggerRef.current) scrollTriggerRef.current.refresh();
    };
    const debouncedRefresh = debounce(refreshIfActive, 150);

    window.addEventListener('load', refreshIfActive, { once: true });
    window.addEventListener('resize', debouncedRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener('resize', debouncedRefresh);
      (debouncedRefresh as typeof debouncedRefresh & { cancel: () => void }).cancel();
      revert?.();
    };
  }, [backdropRef]);
}
