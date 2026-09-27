import { useEffect, useRef, useCallback, useState } from 'react';
import type { ToneName } from '@/lib/tone';
import { computeStaticFlightGradient } from '@/lib/tone';
import { useReducedMotion } from './useReducedMotion';
import {
  supportsScrollDrivenAnimations,
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
 *
 * Progressive enhancement strategy:
 * 1. Native support (Chrome 115+, Edge 115+, Safari 17.4+) → use native CSS Scroll-driven Animations
 * 2. No native support but polyfill available (Firefox, older Safari) → load polyfill, then use CSS animations
 * 3. Reduced motion → static gradient + IntersectionObserver for tone flips (NO polyfill)
 * 4. No polyfill / polyfill failed → static gradient + scroll listener fallback
 */
interface TonePublisherOptions {
  /** Called when the body text tone should flip */
  onToneChange: (tone: ToneName) => void;
  /** Called when the muted text tone should flip */
  onSoftToneChange: (tone: ToneName) => void;
  /** The backdrop element (for CSS animation attachment) */
  backdropRef: React.RefObject<HTMLDivElement | null>;
}

type EngineMode = 'css-scroll-animations' | 'polyfill' | 'css-fallback' | 'fallback';

export function useSceneTonePublisher({
  onToneChange,
  onSoftToneChange,
  backdropRef,
}: TonePublisherOptions): void {
  const prefersReducedMotion = useReducedMotion();
  const [polyfillLoaded, setPolyfillLoaded] = useState(false);
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

  // Polyfill loading is only relevant for FULL MOTION mode.
  // In reduced motion we use CSS static gradient fallback, so polyfill is never needed.
  const loadPolyfill = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined') return false;
    if (polyfillLoaded) return true;

    try {
      // Dynamic import of the polyfill — only loads when needed.
      // Use a variable to prevent static analysis by the bundler.
      const polyfillModule = 'scroll-timeline-polyfill';
      await import(/* @vite-ignore */ polyfillModule);
      setPolyfillLoaded(true);
      return true;
    } catch (error) {
      console.warn('[TonalEngine] Polyfill failed to load:', error);
      return false;
    }
  }, [polyfillLoaded]);

  const setupEngine = useCallback(
    async (prefersReduced: boolean) => {
      const backdrop = backdropRefCurrent.current;
      if (!backdrop) return;

      // Clean up previous setup
      cleanupRef.current?.();

      prefersReducedRef.current = prefersReduced;

      // Apply the CSS animation class to the backdrop
      backdrop.classList.add('flight-backdrop');

      // Reduced motion: ALWAYS use static gradient + IntersectionObserver.
      // Never load polyfill in reduced motion — it would patch global APIs
      // and break the CSS-based static gradient fallback.
      if (prefersReduced) {
        backdrop.style.animation = 'none';

        cleanupRef.current = setupIntersectionObserver(
          (tone) => onToneChangeRef.current?.(tone),
          (tone) => onSoftToneChangeRef.current?.(tone),
          true,
        );

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('tonal-engine-load', { detail: { engine: 'css-fallback' } }),
          );
        }
        return;
      }

      // Full motion: check native support first
      let supported = supportsScrollDrivenAnimations();

      // If no native support, try to load polyfill (only in full motion mode)
      if (!supported) {
        // Multi-layer guard against loading polyfill in reduced motion:
        // 1. Check hook value (set during render)
        // 2. Check media query directly (immediate)
        // 3. Check media query in rAF (deferred, ensures browser evaluated media queries)
        // 4. Check computed style for static gradient (CSS fallback indicator)
        //
        // Only load polyfill if ALL checks confirm we're NOT in reduced motion.

        // Immediate checks
        const prefersReducedImmediate =
          prefersReducedRef.current ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Deferred check via rAF — ensures browser has evaluated media queries
        const checkReducedMotionDeferred = (): Promise<boolean> => {
          return new Promise((resolve) => {
            if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
              resolve(false);
              return;
            }
            requestAnimationFrame(() => {
              const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
              resolve(prefersReduced);
            });
          });
        };

        if (prefersReducedImmediate) {
          // Immediate check says reduced motion — don't load polyfill
          supported = false;
        } else {
          // Wait for rAF to confirm, then decide
          const prefersReducedDeferred = await checkReducedMotionDeferred();

          if (prefersReducedDeferred) {
            // Deferred check confirms reduced motion — don't load polyfill
            supported = false;
          } else {
            // Safety net: also check if CSS static gradient is already applied
            const computedStyle = window.getComputedStyle(backdrop);
            const hasStaticGradient = computedStyle.backgroundImage.includes('gradient');

            if (!hasStaticGradient) {
              const polyfillSuccess = await loadPolyfill();
              if (polyfillSuccess) {
                // Re-check after polyfill load — it polyfills the API so the feature detect should pass
                supported = supportsScrollDrivenAnimations();
              }
            } else {
              // Static gradient already applied (reduced motion fallback) — treat as unsupported
              supported = false;
            }
          }
        }
      }

      scrollAnimationsSupportedRef.current = supported;

      if (!supported) {
        // No native support and polyfill failed/unavailable → static gradient + scroll listener
        backdrop.style.animation = 'none';

        cleanupRef.current = setupScrollListenerFallback(
          (tone) => onToneChangeRef.current?.(tone),
          (tone) => onSoftToneChangeRef.current?.(tone),
        );

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('tonal-engine-load', { detail: { engine: 'fallback' } }),
          );
        }
        return;
      }

      // Full motion with CSS Scroll-driven Animations (native or polyfilled) + IntersectionObserver
      // The backdrop animation is handled by CSS (flight-backdrop class)
      // We just need to set up IntersectionObserver for tone publishing

      cleanupRef.current = setupIntersectionObserver(
        (tone) => onToneChangeRef.current?.(tone),
        (tone) => onSoftToneChangeRef.current?.(tone),
        false,
      );

      const engineMode: EngineMode = polyfillLoaded ? 'polyfill' : 'css-scroll-animations';

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('tonal-engine-load', { detail: { engine: engineMode } }),
        );
      }
    },
    [loadPolyfill, polyfillLoaded],
  );

  useEffect(() => {
    let cancelled = false;

    // Initial setup
    const initialize = async (): Promise<void> => {
      await setupEngine(prefersReducedMotion);
    };
    void initialize();

    // Refresh on load and resize (debounced)
    const refreshIfActive = (): void => {
      if (!cancelled && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('scroll'));
      }
    };

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const debouncedRefresh = (): void => {
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
        setupEngine(newPrefersReduced);
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
  }, [setupEngine, prefersReducedMotion]);
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
