import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { debounce } from '@/lib/debounce';
import {
  FLIP_PROGRESS,
  publishedToneFor,
  BACKDROP_TONES,
  TONAL_TRANSITIONS,
  type ToneName,
} from '@/lib/tone';

/**
 * Detects support for CSS Scroll-driven Animations (animation-timeline: scroll()).
 * Supported in Chrome 115+, Edge 115+, Opera 101+, Safari 17.4+ (behind flag).
 */
function supportsScrollDrivenAnimations(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  // Check for animation-timeline support
  const testEl = document.createElement('div');
  // @ts-expect-error - animationTimeline is not in TypeScript's CSSStyleDeclaration yet
  testEl.style.animationTimeline = 'scroll()';
  // @ts-expect-error - animationTimeline is not in TypeScript's CSSStyleDeclaration yet
  return testEl.style.animationTimeline === 'scroll()';
}

/**
 * Detects reduced motion at runtime.
 */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Computes the published scene tone for a given scroll progress (0..1)
 * based on the static flight gradient profile. Used in fallback mode
 * when CSS Scroll-driven Animations are not supported.
 */
function publishedToneForProgress(progress: number): ToneName {
  if (progress < 0.25) return 'paper'; // ground + climb (foschia)
  if (progress < 0.625) return 'night'; // cruise (night x3)
  if (progress < 0.875) return 'paper'; // descent (alba + paper)
  return 'night'; // contact (night) - outside scene but included for completeness
}

/**
 * Sets up scroll-based tone publishing for the static fallback.
 * Used when CSS Scroll-driven Animations are not supported.
 */
function setupStaticFallbackTonePublishing(
  onToneChange: (tone: ToneName) => void,
  onSoftToneChange: (tone: ToneName) => void,
): () => void {
  let lastPublishedTone: ToneName = 'paper';
  let lastPublishedSoftTone: ToneName = 'paper';

  const updateToneFromScroll = (): void => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
    const tone = publishedToneForProgress(progress);
    if (tone !== lastPublishedTone) {
      lastPublishedTone = tone;
      onToneChange(tone);
    }
    if (tone !== lastPublishedSoftTone) {
      lastPublishedSoftTone = tone;
      onSoftToneChange(tone);
    }
  };

  // Initial publish
  updateToneFromScroll();

  // Throttled scroll listener
  const throttledUpdate = debounce(updateToneFromScroll, 50);
  window.addEventListener('scroll', throttledUpdate, { passive: true });

  return () => {
    window.removeEventListener('scroll', throttledUpdate);
    throttledUpdate.cancel();
  };
}

/**
 * The element a transition's flip line is measured against.
 * A section's own heading (marked with data-tone-trigger) is the actual content
 * whose legibility the crossfade must protect.
 */
function transitionTrigger(sectionId: string): Element | null {
  const section = document.getElementById(sectionId);
  return (
    section?.querySelector('[data-tone-trigger]') ?? section?.querySelector('h1, h2') ?? section
  );
}

/**
 * Sets up IntersectionObserver-based tone publishing for the CSS-driven animation.
 * Observes the heading elements that mark each transition's flip line.
 */
function setupIntersectionObserverTonePublishing(
  onToneChange: (tone: ToneName) => void,
  onSoftToneChange: (tone: ToneName) => void,
): () => void {
  const prefersReduced = prefersReducedMotion();

  // Map of transition trigger -> flip line data
  const flipLines = new Map<string, { body: number; soft: number }>();
  for (const transition of TONAL_TRANSITIONS) {
    const lines = FLIP_PROGRESS[transition.trigger];
    if (lines) {
      flipLines.set(transition.trigger, lines);
    }
  }

  // For reduced motion: observe the flip line position (discrete switch)
  // For full motion: observe both body and soft flip lines

  const observerOptions: IntersectionObserverInit = {
    root: null, // viewport
    rootMargin: '0px',
    threshold: prefersReduced ? [0, 1] : [0, 0.5, 1], // more granular for full motion
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const triggerId = entry.target.id; // data-tone-trigger element's section ID
      const lines = flipLines.get(triggerId);
      if (!lines) continue;

      const transition = TONAL_TRANSITIONS.find((t) => t.trigger === triggerId);
      if (!transition) continue;

      const isIntersecting = entry.isIntersecting;
      const ratio = entry.intersectionRatio;

      if (prefersReduced) {
        // Reduced motion: discrete switch at the body line
        // The trigger element has its top at the flip line position
        // When it intersects (enters viewport), we've crossed the line
        const toneName = isIntersecting
          ? publishedToneFor(transition.to)
          : publishedToneFor(transition.from);
        onToneChange(toneName);
        onSoftToneChange(toneName);
      } else {
        // Full motion: we use the intersection ratio to approximate progress
        // The trigger's top moves from viewport bottom (ratio 0) to center (ratio ~0.5)
        // This is an approximation; the real flip is driven by CSS animation
        // We fire tone changes based on the precomputed flip lines
        const progress = 1 - ratio * 2; // Approximate: ratio 1 (top at bottom) -> progress 0; ratio 0 (top at center) -> progress 1

        // Body flip
        if (progress >= lines.body && entry.boundingClientRect.top < window.innerHeight / 2) {
          onToneChange(publishedToneFor(transition.to));
        } else if (
          progress < lines.body &&
          entry.boundingClientRect.top >= window.innerHeight / 2
        ) {
          onToneChange(publishedToneFor(transition.from));
        }

        // Soft flip
        if (progress >= lines.soft && entry.boundingClientRect.top < window.innerHeight / 2) {
          onSoftToneChange(publishedToneFor(transition.to));
        } else if (
          progress < lines.soft &&
          entry.boundingClientRect.top >= window.innerHeight / 2
        ) {
          onSoftToneChange(publishedToneFor(transition.from));
        }
      }
    }
  }, observerOptions);

  // Observe each trigger element
  const observedElements = new Set<Element>();
  for (const transition of TONAL_TRANSITIONS) {
    const trigger = transitionTrigger(transition.trigger);
    if (trigger && !observedElements.has(trigger)) {
      // Add a unique ID to the trigger for identification
      trigger.id = `tone-trigger-${transition.trigger}`;
      observer.observe(trigger);
      observedElements.add(trigger);
    }
  }

  return () => {
    observer.disconnect();
  };
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

  const cleanupRef = useRef<(() => void) | null>(null);
  const prefersReducedRef = useRef(prefersReducedMotion());
  const scrollAnimationsSupportedRef = useRef(false);

  useEffect(() => {
    const el = backdropRef.current;
    if (!el) return;

    // TypeScript doesn't narrow `el` inside async functions, so we use a local const
    const backdrop = el;

    let cancelled = false;
    let fallbackCleanup: (() => void) | null = null;

    async function setup(): Promise<void> {
      try {
        // Check if CSS Scroll-driven Animations are supported
        const supported = supportsScrollDrivenAnimations();
        scrollAnimationsSupportedRef.current = supported;
        prefersReducedRef.current = prefersReducedMotion();

        // Apply the CSS animation class to the backdrop
        backdrop.classList.add('flight-backdrop');

        if (!supported || prefersReducedRef.current) {
          // Fallback: static gradient + scroll listener for tone publishing
          if (!supported) {
            // Set static gradient as fallback
            const gradient = [
              `${BACKDROP_TONES.paper} 0%`,
              `${BACKDROP_TONES.paper} 12.5%`,
              `${BACKDROP_TONES.foschia} 12.5%`,
              `${BACKDROP_TONES.foschia} 25%`,
              `${BACKDROP_TONES.night} 25%`,
              `${BACKDROP_TONES.night} 37.5%`,
              `${BACKDROP_TONES.night} 37.5%`,
              `${BACKDROP_TONES.night} 50%`,
              `${BACKDROP_TONES.night} 50%`,
              `${BACKDROP_TONES.night} 62.5%`,
              `${BACKDROP_TONES.alba} 62.5%`,
              `${BACKDROP_TONES.alba} 75%`,
              `${BACKDROP_TONES.paper} 75%`,
              `${BACKDROP_TONES.paper} 87.5%`,
              `${BACKDROP_TONES.night} 87.5%`,
              `${BACKDROP_TONES.night} 100%`,
            ].join(', ');
            backdrop.style.backgroundImage = `linear-gradient(to bottom, ${gradient})`;
            backdrop.style.backgroundColor = 'transparent';
            backdrop.style.animation = 'none';
          }

          fallbackCleanup = setupStaticFallbackTonePublishing(
            (tone) => onToneChangeRef.current?.(tone),
            (tone) => onSoftToneChangeRef.current?.(tone),
          );

          // Dispatch fallback event for telemetry
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('tonal-engine-load', {
                detail: { engine: supported ? 'css-fallback' : 'fallback' },
              }),
            );
          }
          return;
        }

        // Full motion with CSS Scroll-driven Animations + IntersectionObserver
        // The backdrop animation is handled by CSS (flight-backdrop class)
        // We just need to set up IntersectionObserver for tone publishing

        fallbackCleanup = setupIntersectionObserverTonePublishing(
          (tone) => onToneChangeRef.current?.(tone),
          (tone) => onSoftToneChangeRef.current?.(tone),
        );

        // Dispatch success event for telemetry
        if (typeof window !== 'undefined' && !cancelled) {
          window.dispatchEvent(
            new CustomEvent('tonal-engine-load', { detail: { engine: 'css-scroll-animations' } }),
          );
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('Tonal engine: setup failed; applying degraded static gradient.', err);

        // Emergency fallback: static gradient
        if (backdrop && typeof window !== 'undefined') {
          const gradient = [
            `${BACKDROP_TONES.paper} 0%`,
            `${BACKDROP_TONES.paper} 12.5%`,
            `${BACKDROP_TONES.foschia} 12.5%`,
            `${BACKDROP_TONES.foschia} 25%`,
            `${BACKDROP_TONES.night} 25%`,
            `${BACKDROP_TONES.night} 37.5%`,
            `${BACKDROP_TONES.night} 37.5%`,
            `${BACKDROP_TONES.night} 50%`,
            `${BACKDROP_TONES.night} 50%`,
            `${BACKDROP_TONES.night} 62.5%`,
            `${BACKDROP_TONES.alba} 62.5%`,
            `${BACKDROP_TONES.alba} 75%`,
            `${BACKDROP_TONES.paper} 75%`,
            `${BACKDROP_TONES.paper} 87.5%`,
            `${BACKDROP_TONES.night} 87.5%`,
            `${BACKDROP_TONES.night} 100%`,
          ].join(', ');
          backdrop.style.backgroundImage = `linear-gradient(to bottom, ${gradient})`;
          backdrop.style.backgroundColor = 'transparent';
          backdrop.style.animation = 'none';
          backdrop.classList.remove('flight-backdrop');

          fallbackCleanup = setupStaticFallbackTonePublishing(
            (tone) => onToneChangeRef.current?.(tone),
            (tone) => onSoftToneChangeRef.current?.(tone),
          );
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
      }
    }

    void setup();

    const refreshIfActive = (): void => {
      if (!cancelled && typeof window !== 'undefined') {
        // Force re-evaluation of scroll position for tone publishing
        // (useful after layout shifts)
        window.dispatchEvent(new Event('scroll'));
      }
    };
    const debouncedRefresh = debounce(refreshIfActive, 150);

    window.addEventListener('load', refreshIfActive, { once: true });
    window.addEventListener('resize', debouncedRefresh);

    // Handle reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (): void => {
      if (cancelled) return;
      const newPrefersReduced = mediaQuery.matches;
      if (newPrefersReduced !== prefersReducedRef.current) {
        prefersReducedRef.current = newPrefersReduced;
        // Re-setup the engine
        fallbackCleanup?.();
        setup();
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      cancelled = true;
      window.removeEventListener('load', refreshIfActive);
      window.removeEventListener('resize', debouncedRefresh);
      mediaQuery.removeEventListener('change', handleChange);
      debouncedRefresh.cancel();
      fallbackCleanup?.();
      cleanupRef.current?.();
    };
  }, [backdropRef]);
}

/**
 * Renders the static flight gradient as a fallback when CSS Scroll-driven Animations
 * are not supported. Exported for testing.
 */
export function renderStaticFlightGradient(el: HTMLElement): void {
  const gradient = [
    `${BACKDROP_TONES.paper} 0%`,
    `${BACKDROP_TONES.paper} 12.5%`,
    `${BACKDROP_TONES.foschia} 12.5%`,
    `${BACKDROP_TONES.foschia} 25%`,
    `${BACKDROP_TONES.night} 25%`,
    `${BACKDROP_TONES.night} 37.5%`,
    `${BACKDROP_TONES.night} 37.5%`,
    `${BACKDROP_TONES.night} 50%`,
    `${BACKDROP_TONES.night} 50%`,
    `${BACKDROP_TONES.night} 62.5%`,
    `${BACKDROP_TONES.alba} 62.5%`,
    `${BACKDROP_TONES.alba} 75%`,
    `${BACKDROP_TONES.paper} 75%`,
    `${BACKDROP_TONES.paper} 87.5%`,
    `${BACKDROP_TONES.night} 87.5%`,
    `${BACKDROP_TONES.night} 100%`,
  ].join(', ');
  el.style.backgroundImage = `linear-gradient(to bottom, ${gradient})`;
  el.style.backgroundColor = 'transparent';
  el.style.animation = 'none';
  el.classList.remove('flight-backdrop');
}
