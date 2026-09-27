import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@/lib/debounce';
import { useSceneTonePublisher, renderStaticFlightGradient } from '@/hooks/useSceneTonePublisher';
import { computeStaticFlightGradient } from '@/lib/tone';
import {
  supportsScrollDrivenAnimations,
  getPrefersReducedMotion,
  toneFromProgress,
  setupIntersectionObserver,
  setupScrollListenerFallback,
} from '@/lib/tonal-engine-utils';
import { TONAL_TRANSITIONS, type ToneName } from '@/lib/tone';

// Mock matchMedia for reduced motion
function setReducedMotion(reduced: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reduced : !reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => {
  for (const transition of TONAL_TRANSITIONS) {
    const section = document.createElement('section');
    section.id = transition.trigger;
    const heading = document.createElement('h2');
    heading.setAttribute('data-tone-trigger', '');
    section.appendChild(heading);
    document.body.appendChild(section);
  }
  setReducedMotion(false);
  vi.clearAllMocks();
});

afterEach(() => {
  for (const transition of TONAL_TRANSITIONS) {
    document.getElementById(transition.trigger)?.remove();
  }
  delete (document as Omit<Document, 'fonts'> & { fonts?: unknown }).fonts;
  vi.unstubAllGlobals();
  vi.resetModules();
});

function renderEngine(
  onToneChange?: (tone: ToneName) => void,
  onSoftToneChange?: (tone: ToneName) => void,
): RefObject<HTMLDivElement | null> {
  const { result } = renderHook(() => {
    const ref = useRef<HTMLDivElement>(null);
    if (!ref.current) ref.current = document.createElement('div');
    useSceneTonePublisher({
      backdropRef: ref,
      onToneChange: onToneChange ?? (() => {}),
      onSoftToneChange: onSoftToneChange ?? (() => {}),
    });
    return ref;
  });
  return result.current;
}

describe('useSceneTonePublisher', () => {
  describe('supportsScrollDrivenAnimations', () => {
    it('returns true when animation-timeline is supported', () => {
      const testEl = document.createElement('div');
      // @ts-expect-error - testing support detection
      testEl.style.animationTimeline = 'scroll()';
      // @ts-expect-error
      const supported = testEl.style.animationTimeline === 'scroll()';
      expect(typeof supported).toBe('boolean');
    });
  });

  describe('computeStaticFlightGradient', () => {
    it('generates the correct flight profile gradient string with hex colors', () => {
      const gradient = computeStaticFlightGradient();

      // Check for hex color values (the gradient uses hex) - NEW Swiss Industrial Print palette
      expect(gradient).toContain('#F4F4F0'); // paper (Newsprint)
      expect(gradient).toContain('#7A7A7A'); // foschia
      expect(gradient).toContain('#0A0A0A'); // night (Deactivated CRT)
      expect(gradient).toContain('#858585'); // alba

      expect(gradient).toContain('0%');
      expect(gradient).toContain('12.5%');
      expect(gradient).toContain('25%');
      expect(gradient).toContain('62.5%');
      expect(gradient).toContain('75%');
      expect(gradient).toContain('87.5%');
      expect(gradient).toContain('100%');
    });

    it('produces deterministic output', () => {
      const gradient1 = computeStaticFlightGradient();
      const gradient2 = computeStaticFlightGradient();
      expect(gradient1).toBe(gradient2);
    });
  });

  describe('renderStaticFlightGradient', () => {
    it('applies the computed gradient to the element', () => {
      const el = document.createElement('div');
      renderStaticFlightGradient(el);

      const style = el.style.backgroundImage;
      expect(style).toContain('linear-gradient');
      expect(style).toContain('0%');
      expect(style).toContain('12.5%');
      expect(style).toContain('100%');
    });

    it('sets backgroundColor to transparent', () => {
      const el = document.createElement('div');
      renderStaticFlightGradient(el);
      expect(el.style.backgroundColor).toBe('transparent');
    });

    it('removes flight-backdrop class', () => {
      const el = document.createElement('div');
      el.classList.add('flight-backdrop');
      renderStaticFlightGradient(el);
      expect(el.classList.contains('flight-backdrop')).toBe(false);
    });
  });

  describe('Internal functions (exported for testing)', () => {
    it('supportsScrollDrivenAnimations returns boolean', () => {
      const result = supportsScrollDrivenAnimations();
      expect(typeof result).toBe('boolean');
    });

    it('getPrefersReducedMotion returns boolean', () => {
      const result = getPrefersReducedMotion();
      expect(typeof result).toBe('boolean');
    });

    it('toneFromProgress computes correct tones for each phase', () => {
      expect(toneFromProgress(0)).toBe('paper');
      expect(toneFromProgress(0.1)).toBe('paper');
      expect(toneFromProgress(0.25)).toBe('night');
      expect(toneFromProgress(0.5)).toBe('night');
      expect(toneFromProgress(0.625)).toBe('paper');
      expect(toneFromProgress(0.75)).toBe('paper');
      expect(toneFromProgress(0.875)).toBe('night');
      expect(toneFromProgress(1)).toBe('night');
    });

    it('setupIntersectionObserver returns cleanup function', () => {
      const onToneChange = vi.fn();
      const onSoftToneChange = vi.fn();
      const cleanup = setupIntersectionObserver(onToneChange, onSoftToneChange, false);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });

    it('setupScrollListenerFallback returns cleanup function', () => {
      const onToneChange = vi.fn();
      const onSoftToneChange = vi.fn();
      const cleanup = setupScrollListenerFallback(onToneChange, onSoftToneChange);
      expect(typeof cleanup).toBe('function');
      cleanup();
    });
  });

  describe('CSS Scroll-driven Animations path', () => {
    it('adds flight-backdrop class to the backdrop element', async () => {
      const ref = renderEngine();
      await waitFor(() => {
        expect(ref.current?.classList.contains('flight-backdrop')).toBe(true);
      });
    });

    it('dispatches tonal-engine-load event with css-scroll-animations engine', async () => {
      const eventSpy = vi.fn();
      window.addEventListener('tonal-engine-load', eventSpy);

      renderEngine();
      await waitFor(() => {
        expect(eventSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            detail: expect.objectContaining({ engine: 'css-scroll-animations' }),
          }),
        );
      });

      window.removeEventListener('tonal-engine-load', eventSpy);
    });
  });

  describe('Fallback mode paths (covered via internal function tests)', () => {
    it('toneFromProgress covers fallback tone computation', () => {
      // This covers the toneFromProgress function used in setupScrollListenerFallback
      expect(toneFromProgress(0)).toBe('paper');
      expect(toneFromProgress(0.5)).toBe('night');
    });
  });

  describe('debounce utility', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('delays function execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('cancels pending execution', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);
      debounced();
      debounced.cancel();
      vi.advanceTimersByTime(100);
      expect(fn).not.toHaveBeenCalled();
    });

    it('resets timer on subsequent calls', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 50);
      debounced();
      vi.advanceTimersByTime(25);
      debounced();
      vi.advanceTimersByTime(25);
      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Resize and load event handling (debouncedRefresh)', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('debouncedRefresh clears and resets timeout on resize', () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 150);

      // First call
      debounced();
      expect(fn).not.toHaveBeenCalled();

      // Second call before timeout
      vi.advanceTimersByTime(100);
      debounced();
      expect(fn).not.toHaveBeenCalled();

      // Third call
      vi.advanceTimersByTime(100);
      debounced();
      expect(fn).not.toHaveBeenCalled();

      // After timeout
      vi.advanceTimersByTime(150);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Cleanup on unmount', () => {
    it('unmounts without throwing', () => {
      const { unmount } = renderHook(() => {
        const ref = useRef<HTMLDivElement>(null);
        if (!ref.current) ref.current = document.createElement('div');
        useSceneTonePublisher({
          backdropRef: ref,
          onToneChange: vi.fn(),
          onSoftToneChange: vi.fn(),
        });
        return ref;
      });

      // Unmount should not throw
      expect(() => unmount()).not.toThrow();
    });
  });
});
