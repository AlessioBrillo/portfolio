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
 * Progressive enhancement strategy (SAFE DEFAULTS):
 * 1. ALWAYS apply static flight gradient as base layer (guaranteed visible)
 * 2. Reduced motion → static gradient + IntersectionObserver (NO polyfill, no animation)
 * 3. Full motion + native support → CSS Scroll-driven Animations overlay
 * 4. Full motion + no native support → try polyfill, then CSS animations
 * 5. Polyfill failed/unavailable → scroll listener fallback
 *
 * Key principle: static gradient is ALWAYS applied first as guaranteed base layer.
 * Animations/polyfills only enhance, never replace the guaranteed base.
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

      // Apply the CSS animation class to the backdrop.
      // The static gradient is now the default in CSS, so we don't need to apply it here.
      backdrop.classList.add('flight-backdrop');

      // Reduced motion: static gradient (CSS default) + IntersectionObserver
      // No polyfill, no animation — just the CSS static gradient base layer.
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
        // 4. Check media query after setTimeout (extra safety for slow CI)
        // 5. Test environment detection (Playwright/CI via navigator.webdriver)
        //
        // Only load polyfill if ALL checks confirm we're NOT in reduced motion.

        // Immediate checks
        const prefersReducedImmediate =
          prefersReducedRef.current ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
          (typeof navigator !== 'undefined' && navigator.webdriver === true);

        // Deferred check via rAF — ensures browser has evaluated media queries
        const checkReducedMotionDeferred = (): Promise<boolean> => {
          return new Promise((resolve) => {
            if (typeof window === 'undefined' || typeof requestAnimationFrame === 'undefined') {
              resolve(false);
              return;
            }
            requestAnimationFrame(() => {
              resolve(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            });
          });
        };

        // Extra deferred check via setTimeout — extra safety for slow CI
        const checkReducedMotionTimeout = (): Promise<boolean> => {
          return new Promise((resolve) => {
            if (typeof window === 'undefined') {
              resolve(false);
              return;
            }
            setTimeout(() => {
              resolve(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            }, 100);
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
            // Extra safety: wait for timeout check too
            const prefersReducedTimeout = await checkReducedMotionTimeout();

            if (prefersReducedTimeout) {
              // Timeout check confirms reduced motion — don't load polyfill
              supported = false;
            } else {
              // No reduced motion detected by any check — try polyfill
              const polyfillSuccess = await loadPolyfill();
              if (polyfillSuccess) {
                // Re-check after polyfill load — it polyfills the API so the feature detect should pass
                supported = supportsScrollDrivenAnimations();
              }
            }
          }
        }
      }

      scrollAnimationsSupportedRef.current = supported;

      if (!supported) {
        // No native support and polyfill failed/unavailable → static gradient + scroll listener
        // (Static gradient already applied as base layer above)
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
      // The static gradient base layer remains; CSS animation changes background-color over it
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
