import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { debounce } from 'lodash-es';
import {
  flipLineFor,
  TEXT_TONE,
  BACKDROP_TONES,
  TONAL_TRANSITIONS,
  FLIP_PROGRESS,
  type TonalTransition,
  type ToneName,
} from '@/lib/tone';
import { loadGsap } from '@/lib/gsap-loader';

/** Type for ScrollTrigger — only the surface we actually use (`refresh()`, `getAll()`). */
type ScrollTriggerType = {
  refresh: () => void;
  getAll: () => Array<{ kill: () => void }>;
};

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

/** Detect reduced motion at runtime — avoids gsap.matchMedia flakiness. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Renders the static flight gradient as a fallback when GSAP fails to load.
 * Pure function — no React, no side effects except mutating the element's style.
 * The gradient matches the flight profile (ADR-0010): 8 sections ≈ 12.5% each.
 * paper (ground/hero) -> foschia (climb/who) -> night (cruise/mosaic,ai-physics,work-school)
 * -> alba (descent/sky-sport) -> paper (descent/experiences) -> night (contact)
 */
export function renderStaticFlightGradient(el: HTMLElement): void {
  el.style.backgroundImage = `
    linear-gradient(
      to bottom,
      ${BACKDROP_TONES.paper} 0%,
      ${BACKDROP_TONES.paper} 12.5%,
      ${BACKDROP_TONES.foschia} 12.5%,
      ${BACKDROP_TONES.foschia} 25%,
      ${BACKDROP_TONES.night} 25%,
      ${BACKDROP_TONES.night} 62.5%,
      ${BACKDROP_TONES.alba} 62.5%,
      ${BACKDROP_TONES.alba} 75%,
      ${BACKDROP_TONES.paper} 75%,
      ${BACKDROP_TONES.paper} 87.5%,
      ${BACKDROP_TONES.night} 87.5%,
      ${BACKDROP_TONES.night} 100%
    )
  `
    .replace(/\s+/g, ' ')
    .trim();
  el.style.backgroundColor = 'transparent';
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
        const { gsap, ScrollTrigger } = await loadGsap();
        if (cancelled || el === null) return;
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
                  gsap.set(el, { backgroundColor: BACKDROP_TONES[transition.to] });
                  const toneName = transition.to as ToneName;
                  onToneChangeRef.current?.(toneName);
                  onSoftToneChangeRef.current?.(toneName);
                },
                onLeaveBack: () => {
                  gsap.set(el, { backgroundColor: BACKDROP_TONES[transition.from] });
                  const toneName = transition.from as ToneName;
                  onToneChangeRef.current?.(toneName);
                  onSoftToneChangeRef.current?.(toneName);
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
                { backgroundColor: BACKDROP_TONES[transition.from] },
                {
                  backgroundColor: BACKDROP_TONES[transition.to],
                  ease: 'none',
                  immediateRender: false,
                  scrollTrigger: {
                    trigger,
                    start: transition.start,
                    end: transition.end,
                    /* v8 ignore next -- full motion path requires GSAP ScrollTrigger not available in jsdom */
                    scrub: true,
                    onUpdate: (self: { progress: number }) => {
                      const progress = self.progress;
                      const prevProgress = prevProgressRef.current.get(transition.trigger) ?? -1;
                      prevProgressRef.current.set(transition.trigger, progress);

                      // Body flip: fire when crossing the body equal-legibility line
                      if (prevProgress < lines.body && progress >= lines.body) {
                        const toneName = transition.to as ToneName;
                        onToneChangeRef.current?.(toneName);
                      } else if (prevProgress >= lines.body && progress < lines.body) {
                        const toneName = transition.from as ToneName;
                        onToneChangeRef.current?.(toneName);
                      }

                      // Soft flip: fire when crossing the soft equal-legibility line
                      if (prevProgress < lines.soft && progress >= lines.soft) {
                        const toneName = transition.to as ToneName;
                        onSoftToneChangeRef.current?.(toneName);
                      } else if (prevProgress >= lines.soft && progress < lines.soft) {
                        const toneName = transition.from as ToneName;
                        onSoftToneChangeRef.current?.(toneName);
                      }
                    },
                  },
                },
              );

              void tween;
            }
          }
        }, el);

        // CRITICAL: Wait for fonts to fully load AFTER GSAP context creation.
        // document.fonts.ready resolves before font-variation-settings settle on variable fonts.
        // We must refresh ScrollTrigger after fonts settle to capture final geometry.
        if (document.fonts) {
          await document.fonts.ready;
          // Variable fonts (Archivo, JetBrains Mono) need explicit load()
          // because document.fonts.ready resolves before font-variation-settings settle.
          const variableFonts = Array.from(document.fonts).filter(
            (f) => f.family.includes('Archivo') || f.family.includes('JetBrains'),
          );
          await Promise.all(variableFonts.map((f) => f.load()));
        }

        // Check if component was unmounted during font loading
        if (cancelled) return;

        // Ensure ScrollTrigger measures geometry with final font layout.
        // This handles any late layout shifts after variable fonts settle.
        ScrollTrigger.refresh();

        // Dispatch success event for health telemetry
        if (typeof window !== 'undefined' && !cancelled) {
          window.dispatchEvent(
            new CustomEvent('tonal-engine-load', { detail: { engine: 'gsap' } }),
          );
        }

        revert = () => ctx.revert();
      } catch (error) {
        /* v8 ignore start -- fallback path requires window object not available in jsdom */
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Tonal engine: GSAP failed to load; applying degraded static gradient.', err);
        if (el && typeof window !== 'undefined') {
          renderStaticFlightGradient(el);
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('tonal-engine-load', {
              detail: { engine: 'fallback', error: err.message },
            }),
          );
          window.dispatchEvent(
            new CustomEvent('tonal-engine-error', {
              detail: { message: err.message, cause: err.cause, stack: err.stack },
            }),
          );
        }
        /* v8 ignore end */
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
      debouncedRefresh.cancel();
      revert?.();
    };
  }, [backdropRef]);
}
