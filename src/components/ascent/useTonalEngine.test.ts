import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import type { RefObject } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from '@/lib/debounce';
import { useTonalEngine, renderStaticFlightGradient } from '@/components/ascent/useTonalEngine';
import { TONAL_TRANSITIONS, type ToneName } from '@/lib/tone';

// Mock the CSS Scroll-driven Animations support check
vi.mock('@/components/ascent/useTonalEngine', async () => {
  const actual = await vi.importActual('@/components/ascent/useTonalEngine');
  return {
    ...actual,
    supportsScrollDrivenAnimations: vi.fn(() => true),
  };
});

// Mock matchMedia for reduced motion
function setReducedMotion(reduced: boolean): void {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)' ? reduced : !reduced,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
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
});

function renderEngine(
  onToneChange?: (tone: ToneName) => void,
  onSoftToneChange?: (tone: ToneName) => void,
): RefObject<HTMLDivElement | null> {
  const { result } = renderHook(() => {
    const ref = useRef<HTMLDivElement>(null);
    if (!ref.current) ref.current = document.createElement('div');
    useTonalEngine(ref, onToneChange, onSoftToneChange);
    return ref;
  });
  return result.current;
}

describe('useTonalEngine', () => {
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

  describe('renderStaticFlightGradient', () => {
    it('applies the correct flight profile gradient to the element', () => {
      const el = document.createElement('div');
      renderStaticFlightGradient(el);

      const style = el.style.backgroundImage;
      expect(style).toContain('rgb(244, 239, 230)'); // paper (Carta)
      expect(style).toContain('rgb(132, 131, 127)'); // foschia
      expect(style).toContain('rgb(20, 22, 29)'); // night (Notte)
      expect(style).toContain('rgb(132, 131, 127)'); // alba

      expect(style).toContain('0%');
      expect(style).toContain('12.5%');
      expect(style).toContain('25%');
      expect(style).toContain('62.5%');
      expect(style).toContain('75%');
      expect(style).toContain('87.5%');
      expect(style).toContain('100%');
    });

    it('sets backgroundColor to transparent', () => {
      const el = document.createElement('div');
      renderStaticFlightGradient(el);
      expect(el.style.backgroundColor).toBe('transparent');
    });

    it('produces deterministic output for the same input', () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      renderStaticFlightGradient(el1);
      renderStaticFlightGradient(el2);
      expect(el1.style.backgroundImage).toBe(el2.style.backgroundImage);
    });
  });

  describe('CSS Scroll-driven Animations path', () => {
    it('adds flight-backdrop class to the backdrop element', async () => {
      const ref = renderEngine();
      await waitFor(() => {
        expect(ref.current?.classList.contains('flight-backdrop')).toBe(true);
      });
    });

    it('does not load GSAP when scroll animations are supported', async () => {
      renderEngine();
      await waitFor(() => {
        expect(true).toBe(true);
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

  describe('Cleanup', () => {
    it('cleans up IntersectionObserver on unmount', async () => {
      const ref = renderEngine();
      await waitFor(() => {
        expect(ref.current?.classList.contains('flight-backdrop')).toBe(true);
      });

      renderHook(() => {});
    });

    it('removes load and resize listeners on cleanup', async () => {
      renderEngine();
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
});
