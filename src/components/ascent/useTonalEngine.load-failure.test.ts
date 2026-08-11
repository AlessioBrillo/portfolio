import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useTonalEngine } from '@/components/ascent/useTonalEngine';

/**
 * The GSAP module mock throws on evaluation, simulating a failed dynamic
 * import. Kept in its own file so the module registry is fresh: a mock whose
 * factory throws can only fail the *first* evaluation of the module, and any
 * other test file importing the working mock would poison this assertion.
 */
vi.mock('gsap', () => {
  throw new Error('Failed to fetch dynamically imported module');
});

describe('useTonalEngine — GSAP load failure', () => {
  it('logs a console error and keeps the paper fallback', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => {
      const element = useRef<HTMLDivElement>(null);
      if (!element.current) element.current = document.createElement('div');
      useTonalEngine(element);
      return element;
    });

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(errorSpy.mock.calls[0]?.[0]).toContain('Tonal engine');
    expect(result.current.current?.style.backgroundColor).toBe('');
    errorSpy.mockRestore();
  });
});
