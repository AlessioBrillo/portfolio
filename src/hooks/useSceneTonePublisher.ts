import { useEffect, useRef, useCallback } from 'react';
import type { ToneName } from '@/lib/tone';
import { computeStaticFlightGradient } from '@/lib/tone';
import { useReducedMotion } from './useReducedMotion';
import {
  supportsScrollDrivenAnimations,
  getPrefersReducedMotion,
  setupIntersectionObserver,
  setupScrollListenerFallback,
} from '@/lib/tonal-engine-utils';

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
