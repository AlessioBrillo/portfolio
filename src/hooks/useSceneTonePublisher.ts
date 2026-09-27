import { useEffect, useRef, useCallback } from 'react';
import type { ToneName } from '@/lib/tone';
import { publishedToneFor, computeStaticFlightGradient } from '@/lib/tone';
import { TONAL_TRANSITIONS, FLIP_PROGRESS } from '@/lib/tone';
import { useReducedMotion } from './useReducedMotion';

/**
 * Native CSS Scroll-driven Animations implementation of the tonal engine.
 *
 * Replaces GSAP ScrollTrigger with:
 * - CSS `animation-timeline: scroll()` for smooth crossfades (full motion)
 * - IntersectionObserver for discrete tone publishing (both motion modes)
 * - Web Animations API for programmatic control when needed
 *
 * The backdrop animation is entirely CSS-driven. This hook only publishes
 * the current tone to React context via the provided setters.
 */

interface TonePublisherOptions {
  /** Called when the body text tone should flip */
  onToneChange: (tone: ToneName) => void;
  /** Called when the muted text tone should flip */
  onSoftToneChange: (tone: ToneName) => void;
  /** The backdrop element (for CSS animation attachment) */
  backdropRef: React.RefObject<HTMLDivElement | null>;
}

/** Checks if CSS Scroll-driven Animations are supported */
function supportsScrollDrivenAnimations(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const testEl = document.createElement('div');
  // @ts-expect-error - animationTimeline not in TS lib yet
  testEl.style.animationTimeline = 'scroll()';
  // @ts-expect-error
  return testEl.style.animationTimeline === 'scroll()';
}

/** Gets the current reduced motion preference */
function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Computes tone from scroll progress (fallback / reduced motion) */
function toneFromProgress(progress: number): ToneName {
  if (progress < 0.25) return 'paper';
  if (progress < 0.625) return 'night';
  if (progress < 0.875) return 'paper';
  return 'night';
}

/**
 * Sets up IntersectionObserver to publish tone flips at the correct scroll positions.
 * Observes the heading elements that mark each transition's flip line.
 */
function setupIntersectionObserver(
  onToneChange: (tone: ToneName) => void,
  onSoftToneChange: (tone: ToneName) => void,
  prefersReduced: boolean,
): () => void {
  // Map of transition trigger -> flip line data
  const flipLines = new Map<string, { body: number; soft: number }>();
  for (const transition of TONAL_TRANSITIONS) {
    const lines = FLIP_PROGRESS[transition.trigger];
    if (lines) {
      flipLines.set(transition.trigger, lines);
    }
  }

  const observerOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: prefersReduced ? [0, 1] : [0, 0.5, 1],
  };

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const triggerId = entry.target.id;
      const lines = flipLines.get(triggerId);
      if (!lines) continue;

      const transition = TONAL_TRANSITIONS.find((t) => t.trigger === triggerId);
      if (!transition) continue;

      const isIntersecting = entry.isIntersecting;
      const ratio = entry.intersectionRatio;

      if (prefersReduced) {
        // Reduced motion: discrete switch at the body line
        const toneName = isIntersecting
          ? publishedToneFor(transition.to)
          : publishedToneFor(transition.from);
        onToneChange(toneName);
        onSoftToneChange(toneName);
      } else {
        // Full motion: use intersection ratio to approximate progress through the fade window
        // The trigger's top moves from viewport bottom (ratio 0) to center (ratio ~0.5)
        const progress = 1 - ratio * 2;

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

  // Helper to find the tone trigger element for a section
  const transitionTrigger = (sectionId: string): Element | null => {
    const section = document.getElementById(sectionId);
    return (
      section?.querySelector('[data-tone-trigger]') ?? section?.querySelector('h1, h2') ?? section
    );
  };

  // Observe each trigger element
  const observedElements = new Set<Element>();
  for (const transition of TONAL_TRANSITIONS) {
    const trigger = transitionTrigger(transition.trigger);
    if (trigger && !observedElements.has(trigger)) {
      trigger.id = `tone-trigger-${transition.trigger}`;
      observer.observe(trigger);
      observedElements.add(trigger);
    }
  }

  return () => observer.disconnect();
}

/**
 * Sets up scroll-based tone publishing for fallback mode (no CSS scroll animations support)
 */
function setupScrollListenerFallback(
  onToneChange: (tone: ToneName) => void,
  onSoftToneChange: (tone: ToneName) => void,
): () => void {
  let lastPublishedTone: ToneName = 'paper';
  let lastPublishedSoftTone: ToneName = 'paper';

  const updateToneFromScroll = (): void => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.max(0, Math.min(1, scrollTop / docHeight)) : 0;
    const tone = toneFromProgress(progress);
    if (tone !== lastPublishedTone) {
      lastPublishedTone = tone;
      onToneChange(tone);
    }
    if (tone !== lastPublishedSoftTone) {
      lastPublishedSoftTone = tone;
      onSoftToneChange(tone);
    }
  };

  updateToneFromScroll();
  window.addEventListener('scroll', updateToneFromScroll, { passive: true });

  return () => window.removeEventListener('scroll', updateToneFromScroll);
}

export function useSceneTonePublisher({
  onToneChange,
  onSoftToneChange,
  backdropRef,
}: TonePublisherOptions): void {
  const prefersReducedMotion = useReducedMotion();
  const cleanupRef = useRef<(() => void) | null>(null);
  const prefersReducedRef = useRef(prefersReducedMotion);
  const scrollAnimationsSupportedRef = useRef(false);
  const backdropRefCurrent = useRef(backdropRef.current);
  backdropRefCurrent.current = backdropRef.current;

  // Stable refs for callbacks
  const onToneChangeRef = useRef(onToneChange);
  onToneChangeRef.current = onToneChange;
  const onSoftToneChangeRef = useRef(onSoftToneChange);
  onSoftToneChangeRef.current = onSoftToneChange;

  const setupEngine = useCallback(async () => {
    const backdrop = backdropRefCurrent.current;
    if (!backdrop) return;

    // Clean up previous setup
    cleanupRef.current?.();

    const supported = supportsScrollDrivenAnimations();
    const prefersReduced = getPrefersReducedMotion();
    scrollAnimationsSupportedRef.current = supported;
    prefersReducedRef.current = prefersReduced;

    // Apply the CSS animation class to the backdrop
    backdrop.classList.add('flight-backdrop');

    if (!supported || prefersReduced) {
      // Fallback: static gradient + scroll listener for tone publishing
      if (!supported) {
        // The static gradient is already in CSS via --static-flight-gradient custom property
        // Just ensure the backdrop uses it
        backdrop.style.animation = 'none';
      }

      cleanupRef.current = setupScrollListenerFallback(
        (tone) => onToneChangeRef.current?.(tone),
        (tone) => onSoftToneChangeRef.current?.(tone),
      );

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

    cleanupRef.current = setupIntersectionObserver(
      (tone) => onToneChangeRef.current?.(tone),
      (tone) => onSoftToneChangeRef.current?.(tone),
      prefersReduced,
    );

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('tonal-engine-load', { detail: { engine: 'css-scroll-animations' } }),
      );
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Initial setup
    const initialize = async () => {
      await setupEngine();
    };
    void initialize();

    // Refresh on load and resize (debounced)
    const refreshIfActive = (): void => {
      if (!cancelled && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('scroll'));
      }
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedRefresh = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(refreshIfActive, 150);
    };

    window.addEventListener('load', refreshIfActive, { once: true });
    window.addEventListener('resize', debouncedRefresh);

    // Handle reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (): void => {
      if (cancelled) return;
      const newPrefersReduced = mediaQuery.matches;
      if (newPrefersReduced !== prefersReducedRef.current) {
        prefersReducedRef.current = newPrefersReduced;
        setupEngine();
      }
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      cancelled = true;
      window.removeEventListener('load', refreshIfActive);
      window.removeEventListener('resize', debouncedRefresh);
      clearTimeout(resizeTimeout);
      mediaQuery.removeEventListener('change', handleChange);
      cleanupRef.current?.();
    };
  }, [setupEngine]);
}

/**
 * Renders the static flight gradient as a fallback when CSS Scroll-driven Animations
 * are not supported. Exported for testing.
 */
export function renderStaticFlightGradient(el: HTMLElement): void {
  // In production, this uses the CSS custom property. For testing, we generate
  // the actual gradient string so tests can verify the content.
  const gradient = computeStaticFlightGradient();
  el.style.backgroundImage = gradient;
  el.style.backgroundColor = 'transparent';
  el.style.animation = 'none';
  el.classList.remove('flight-backdrop');
}
