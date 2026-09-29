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
  // Allow test environment to force fallback path
  if ((window as unknown as { __FORCE_FALLBACK__?: boolean }).__FORCE_FALLBACK__) return false;
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

/** Computes tone from scroll progress (fallback / reduced motion) — 4-band approximation */
export function toneFromProgress(progress: number): ToneName {
  if (progress < 0.25) return 'paper';
  if (progress < 0.625) return 'night';
  if (progress < 0.875) return 'paper';
  return 'night';
}

/** Computes precise tone from scroll progress using TONAL_TRANSITIONS (8-band) */
export function toneFromProgressPrecise(progress: number): ToneName {
  // Each transition spans 12.5% of the page (1/8)
  const TRANSITION_WIDTH = 1 / 8;
  for (let i = 0; i < TONAL_TRANSITIONS.length; i++) {
    const transition = TONAL_TRANSITIONS[i]!;
    const start = i * TRANSITION_WIDTH;
    const end = start + TRANSITION_WIDTH;
    if (progress >= start && progress < end) {
      // Within this transition's window - determine tone based on progress within window
      const localProgress = (progress - start) / TRANSITION_WIDTH;
      // The transition goes from `from` to `to`; at midpoint (0.5) it's the boundary
      // For tone publishing, we use the published tone of `to` after the midpoint
      return localProgress >= 0.5
        ? publishedToneFor(transition.to)
        : publishedToneFor(transition.from);
    }
  }
  // Contact section (last 12.5%) - night
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
    // Small rootMargin to catch elements slightly before they enter viewport
    rootMargin: '0px 0px -10% 0px',
    // Use dense thresholds for full motion to reliably catch flip points
    // even with programmatic scroll in headless Chrome
    threshold: prefersReduced ? [0, 1] : [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
  };

  // Helper to find the tone trigger element for a section
  const transitionTrigger = (sectionId: string): Element | null => {
    const section = document.getElementById(sectionId);
    return (
      section?.querySelector('[data-tone-trigger]') ?? section?.querySelector('h1, h2') ?? section
    );
  };

  // Map observed element -> transition trigger name (e.g. 'mosaic')
  const triggerMap = new Map<Element, string>();
  const observedElements = new Set<Element>();

  // Create observer first so we can observe in the loop below
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const triggerId = triggerMap.get(entry.target);
      if (!triggerId) continue;
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
        const progress = ratio * 2;

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
  for (const transition of TONAL_TRANSITIONS) {
    const trigger = transitionTrigger(transition.trigger);
    if (trigger && !observedElements.has(trigger)) {
      // Do NOT overwrite the element's ID — the observer callback uses
      // triggerMap (not entry.target.id) to look up flipLines.
      triggerMap.set(trigger, transition.trigger);
      observer.observe(trigger);
      observedElements.add(trigger);
    }
  }

  return () => observer.disconnect();
}

/**
 * Sets up scroll-based tone publishing for fallback mode (no CSS scroll animations support).
 * Tracks trigger element positions to calculate transition-window progress,
 * mimicking IntersectionObserver behavior for reliable tone publishing in headless Chrome.
 * Also updates the backdrop's backgroundColor to match the gradient progression.
 */
export function setupScrollListenerFallback(
  onToneChange: (tone: ToneName) => void,
  onSoftToneChange: (tone: ToneName) => void,
): () => void {
  let lastPublishedTone: ToneName = 'paper';
  let lastPublishedSoftTone: ToneName = 'paper';

  // Helper to find the tone trigger element for a section
  const transitionTrigger = (sectionId: string): Element | null => {
    const section = document.getElementById(sectionId);
    return (
      section?.querySelector('[data-tone-trigger]') ?? section?.querySelector('h1, h2') ?? section
    );
  };

  // Map trigger elements to their transition data
  const triggerData = new Map<
    Element,
    { transition: (typeof TONAL_TRANSITIONS)[0]; elementTop: number }
  >();
  for (const transition of TONAL_TRANSITIONS) {
    const trigger = transitionTrigger(transition.trigger);
    if (trigger) {
      triggerData.set(trigger, { transition, elementTop: 0 });
    }
  }

  const updateTriggerPositions = (): void => {
    for (const [_trigger, data] of triggerData) {
      const rect = _trigger.getBoundingClientRect();
      data.elementTop = rect.top + window.scrollY;
    }
  };

  const backdrop = document.querySelector<HTMLElement>('[data-testid="tonal-backdrop"]');

  const updateToneFromScroll = (): void => {
    updateTriggerPositions();

    const viewportCenter = window.scrollY + window.innerHeight / 2;

    // Find the trigger whose transition window contains the viewport center
    // The transition window: element top moves from viewport bottom (+vh) to viewport center (+vh/2)
    // windowStart (scrollY): elementTop - vh
    // windowEnd (scrollY): elementTop - vh/2
    // At windowStart: viewportCenter = elementTop - vh/2
    // At windowEnd: viewportCenter = elementTop
    // progress = (viewportCenter - (elementTop - vh/2)) / (vh/2)
    let activeTrigger: {
      transition: (typeof TONAL_TRANSITIONS)[0];
      progress: number;
      triggerId: string;
    } | null = null;

    for (const [_trigger, data] of triggerData) {
      const windowEndVpCenter = data.elementTop - window.innerHeight / 2;
      const windowHeight = window.innerHeight / 2;

      const progress = (viewportCenter - windowEndVpCenter) / windowHeight;

      if (progress >= 0 && progress <= 1) {
        // Find the triggerId for this transition
        const triggerId = TONAL_TRANSITIONS.find((t) => t === data.transition)?.trigger;
        activeTrigger = { transition: data.transition, progress, triggerId: triggerId ?? '' };
        break;
      }
    }

    // Also check if we're past all triggers (Contact section)
    if (!activeTrigger) {
      const lastTrigger = Array.from(triggerData.values()).pop();
      if (lastTrigger && viewportCenter > lastTrigger.elementTop) {
        const triggerId = TONAL_TRANSITIONS[TONAL_TRANSITIONS.length - 1]?.trigger;
        activeTrigger = {
          transition: lastTrigger.transition,
          progress: 1,
          triggerId: triggerId ?? '',
        };
      }
    }

    // Check if we're before all triggers (Hero section)
    if (!activeTrigger) {
      const firstTrigger = Array.from(triggerData.values())[0];
      if (firstTrigger && viewportCenter < firstTrigger.elementTop - window.innerHeight) {
        const triggerId = TONAL_TRANSITIONS[0]?.trigger;
        activeTrigger = {
          transition: firstTrigger.transition,
          progress: 0,
          triggerId: triggerId ?? '',
        };
      }
    }

    if (activeTrigger) {
      const { transition, progress, triggerId } = activeTrigger;
      // Use the actual body flip line for this transition instead of hardcoded 0.5
      const flipLine = triggerId ? (FLIP_PROGRESS[triggerId]?.body ?? 0.5) : 0.5;
      const tone =
        progress >= flipLine ? publishedToneFor(transition.to) : publishedToneFor(transition.from);

      // Update backdrop backgroundColor to match the gradient at this position
      if (backdrop) {
        backdrop.style.backgroundColor = tone === 'night' ? '#0A0A0A' : '#F4F4F0';
      }

      if (tone !== lastPublishedTone) {
        lastPublishedTone = tone;
        onToneChange(tone);
      }
      if (tone !== lastPublishedSoftTone) {
        lastPublishedSoftTone = tone;
        onSoftToneChange(tone);
      }
    }
  };

  updateToneFromScroll();
  window.addEventListener('scroll', updateToneFromScroll, { passive: true });

  return () => window.removeEventListener('scroll', updateToneFromScroll);
}
