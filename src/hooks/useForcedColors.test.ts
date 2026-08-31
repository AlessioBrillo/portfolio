import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useForcedColors } from '@/hooks/useForcedColors';

describe('useForcedColors', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((_query: string) => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false by default', () => {
    const { result } = renderHook(() => useForcedColors());
    expect(result.current).toBe(false);
  });

  it('returns true when forced-colors is active', () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((_query: string) => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );

    const { result } = renderHook(() => useForcedColors());
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    let currentMatches = false;

    vi.stubGlobal(
      'matchMedia',
      vi.fn((_query: string) => ({
        get matches() {
          return currentMatches;
        },
        addEventListener: vi.fn((_, cb) => {
          listener = cb;
        }),
        removeEventListener: vi.fn(),
      })),
    );

    const { result } = renderHook(() => useForcedColors());
    expect(result.current).toBe(false);

    act(() => {
      currentMatches = true;
      listener?.({
        matches: true,
        media: '(forced-colors: active)',
        type: 'change',
      } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('cleans up listener on unmount', () => {
    const removeEventListener = vi.fn();
    vi.stubGlobal(
      'matchMedia',
      vi.fn((_query: string) => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener,
      })),
    );

    const { unmount } = renderHook(() => useForcedColors());
    unmount();
    expect(removeEventListener).toHaveBeenCalled();
  });
});
