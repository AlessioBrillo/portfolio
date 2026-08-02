import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAltitudeProfile } from '@/hooks/useAltitudeProfile';

const mockUseScrollProgress = vi.fn();

vi.mock('@/hooks/useScrollProgress', () => ({
  useScrollProgress: () => mockUseScrollProgress(),
}));

const fakeSection = (id: string, top: number): HTMLElement =>
  ({
    id,
    getBoundingClientRect: () => ({ top, height: 0 }) as DOMRect,
  }) as unknown as HTMLElement;

const sections = new Map<string, HTMLElement>();

describe('useAltitudeProfile', () => {
  const originalScrollHeight = document.documentElement.scrollHeight;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    vi.useFakeTimers();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: 1768,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      configurable: true,
      value: 0,
    });

    sections.set('hero', fakeSection('hero', 0));
    sections.set('ai-physics', fakeSection('ai-physics', 500));
    sections.set('contact', fakeSection('contact', 1000));
    vi.spyOn(document, 'getElementById').mockImplementation(
      (id: string) => sections.get(id) ?? null,
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      writable: true,
      configurable: true,
      value: originalScrollHeight,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight,
    });
  });

  it('maps scroll progress to altitude along the rise-and-fall profile', () => {
    mockUseScrollProgress.mockReturnValue(0.25);
    const { result } = renderHook(() => useAltitudeProfile());
    expect(result.current).toBeCloseTo(0.5, 5);
  });

  it('re-measures anchors on resize', () => {
    mockUseScrollProgress.mockReturnValue(0.25);
    const { result } = renderHook(() => useAltitudeProfile());
    expect(result.current).toBeCloseTo(0.5, 5);

    sections.set('ai-physics', fakeSection('ai-physics', 250));
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
    expect(result.current).toBeCloseTo(1, 5);
  });

  it('reads 0 when the page is not scrollable or sections are missing', () => {
    mockUseScrollProgress.mockReturnValue(0.5);
    sections.clear();
    const { result } = renderHook(() => useAltitudeProfile());
    expect(result.current).toBe(0);
  });
});
