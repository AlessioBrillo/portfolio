import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { SECTION_ORDER } from '@/lib/altitude';

interface ObserverEntry {
  target: Element;
  intersectionRatio: number;
}

class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: number[] = [];
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  takeRecords = vi.fn(() => []);

  constructor(callback: IntersectionObserverCallback) {
    triggerObserver = (entries: ObserverEntry[]) => {
      callback(
        entries.map((e) => ({
          target: e.target,
          intersectionRatio: e.intersectionRatio,
          boundingClientRect: {} as DOMRectReadOnly,
          intersectionRect: {} as DOMRectReadOnly,
          isIntersecting: e.intersectionRatio > 0,
          rootBounds: null,
          time: Date.now(),
        })),
        null! as unknown as IntersectionObserver,
      );
    };
  }
}

let triggerObserver: (entries: ObserverEntry[]) => void;

describe('useCurrentSection', () => {
  beforeEach(() => {
    document.body.innerHTML = SECTION_ORDER.map((id) => `<section id="${id}"></section>`).join('');

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.useFakeTimers();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
  });

  it('returns null initially', () => {
    const { result } = renderHook(() => useCurrentSection());
    expect(result.current).toBeNull();
  });

  it('returns the section with the highest intersection ratio', () => {
    const { result } = renderHook(() => useCurrentSection());

    act(() => {
      triggerObserver([
        { target: document.getElementById('hero')!, intersectionRatio: 0.2 },
        { target: document.getElementById('who')!, intersectionRatio: 0.8 },
      ]);
    });

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe('who');
  });

  it('returns null when no section elements exist in the DOM', () => {
    document.body.innerHTML = '';
    const { result } = renderHook(() => useCurrentSection());
    expect(result.current).toBeNull();
  });

  it('ignores entries whose target is outside the section order', () => {
    const { result } = renderHook(() => useCurrentSection());
    const foreign = document.createElement('section');
    foreign.id = 'advert';
    document.body.appendChild(foreign);

    act(() => {
      triggerObserver([{ target: foreign, intersectionRatio: 1 }]);
    });
    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBeNull();
  });

  it('coalesces a burst of callbacks into a single frame update', () => {
    const { result } = renderHook(() => useCurrentSection());

    act(() => {
      triggerObserver([{ target: document.getElementById('hero')!, intersectionRatio: 0.2 }]);
      triggerObserver([{ target: document.getElementById('who')!, intersectionRatio: 0.9 }]);
    });
    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe('who');
  });
});
