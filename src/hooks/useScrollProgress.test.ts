import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useScrollProgress } from '@/hooks/useScrollProgress';

describe('useScrollProgress', () => {
  const originalInnerHeight = window.innerHeight;
  const originalScrollHeight = document.documentElement.scrollHeight;

  beforeEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 900,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1800,
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: originalScrollHeight,
    });

    vi.useRealTimers();
  });

  it('returns 0 when at the top of the document', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('returns 1 when scrolled to the bottom', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 900,
    });

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(1);
  });

  it('returns the correct ratio for a mid-point scroll', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 450,
    });

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0.5);
  });

  it('updates progress on scroll event via RAF', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);

    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 450,
    });

    act(() => {
      window.dispatchEvent(new Event('scroll', { cancelable: true }));
    });

    act(() => {
      vi.advanceTimersByTime(16);
    });

    expect(result.current).toBe(0.5);
  });

  it('clamps progress to [0, 1] when content fits the viewport', () => {
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 900,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    const { result } = renderHook(() => useScrollProgress());
    expect(result.current).toBe(0);
  });

  it('throttles rapid scroll events to a single RAF call', () => {
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    const rafSpy = vi.spyOn(window, 'requestAnimationFrame');
    renderHook(() => useScrollProgress());

    rafSpy.mockClear();

    act(() => {
      window.dispatchEvent(new Event('scroll', { cancelable: true }));
      window.dispatchEvent(new Event('scroll', { cancelable: true }));
      window.dispatchEvent(new Event('scroll', { cancelable: true }));
    });

    expect(rafSpy).toHaveBeenCalledTimes(1);

    rafSpy.mockRestore();
  });
});
