import type { ToneName } from '@/lib/tone';
import { publishedToneFor } from '@/lib/tone';
import { TONAL_TRANSITIONS, FLIP_PROGRESS } from '@/lib/tone';

/**
 * Utility functions for the tonal engine.
 * Separated from the hook to enable unit testing of pure functions.
 */

/** Checks if CSS Scroll-driven Animations are supported */
export function supportsScrollDrivenAnimations(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  const testEl = document.createElement('div');
  // @ts-expect-error - animationTimeline not in TS lib yet
  testEl.style.animationTimeline = 'scroll()';
  // @ts-expect-error
  return testEl.style.animationTimeline === 'scroll()';
}

/** Gets the current reduced motion preference */
export function getPrefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Computes tone from scroll progress (fallback / reduced motion) */
export function toneFromProgress(progress: number): ToneName {
  if (progress < 0.25) return 'paper';
  if (progress < 0.625) return 'night';
  if (progress < 0.875) return 'paper';
  return 'night';
}

/**
 * Sets up IntersectionObserver to publish tone flips at the correct scroll positions.
 * Observes the heading elements that mark each transition's flip line.
 */
export function setupIntersectionObserver(
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
export function setupScrollListenerFallback(
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
