import { renderHook, waitFor } from '@testing-library/react';
import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useTonalEngine } from '@/components/ascent/useTonalEngine';
import { BACKDROP_TONES } from '@/lib/tone';

function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '');
  const r = Number.parseInt(clean.slice(0, 2), 16);
  const g = Number.parseInt(clean.slice(2, 4), 16);
  const b = Number.parseInt(clean.slice(4, 6), 16);
  return `rgb(${r}, ${g}, ${b})`;
}

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
    // Degraded mode applies a static gradient and sets backgroundColor to transparent
    expect(result.current.current?.style.backgroundColor).toBe('transparent');
    errorSpy.mockRestore();
  });

  it('applies a gradient matching the flight profile with foschia and alba stops', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => {
      const element = useRef<HTMLDivElement>(null);
      if (!element.current) element.current = document.createElement('div');
      useTonalEngine(element);
      return element;
    });

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());

    const gradient = result.current.current?.style.backgroundImage;
    expect(gradient).toBeDefined();
    if (!gradient) return;

    // Paper spec palette: Carta #F4EFE6, Foschia #84837F, Notte #14161D, Alba #84837F
    const paperRgb = hexToRgb(BACKDROP_TONES.paper);
    const foschiaRgb = hexToRgb(BACKDROP_TONES.foschia);
    const nightRgb = hexToRgb(BACKDROP_TONES.night);
    const albaRgb = hexToRgb(BACKDROP_TONES.alba);

    // Verify all four tones appear in the gradient
    expect(gradient).toContain(paperRgb);
    expect(gradient).toContain(foschiaRgb);
    expect(gradient).toContain(nightRgb);
    expect(gradient).toContain(albaRgb);

    // Note: foschia and alba share the same color value (#84837F) in the paper spec,
    // so indexOf will find the first occurrence for both. Instead, verify the
    // gradient structure matches the expected flight profile by checking the
    // stop percentages in the computed gradient.
    expect(gradient).toContain('0%');
    expect(gradient).toContain('12.5%');
    expect(gradient).toContain('25%');
    expect(gradient).toContain('37.5%');
    expect(gradient).toContain('50%');
    expect(gradient).toContain('62.5%');
    expect(gradient).toContain('75%');
    expect(gradient).toContain('87.5%');
    expect(gradient).toContain('100%');

    // Check that each stop's colour and position appears in the actual gradient
    // by verifying the canonical sequence is a subsequence of the actual.
    const actual = gradient.replace(/\s+/g, '').toLowerCase();
    const expectedStops = [
      `${paperRgb}0%`,
      `${paperRgb}12.5%`,
      `${foschiaRgb}12.5%`,
      `${foschiaRgb}25%`,
      `${nightRgb}25%`,
      `${nightRgb}37.5%`,
      `${nightRgb}37.5%`,
      `${nightRgb}50%`,
      `${nightRgb}50%`,
      `${nightRgb}62.5%`,
      `${albaRgb}62.5%`,
      `${albaRgb}75%`,
      `${paperRgb}75%`,
      `${paperRgb}87.5%`,
      `${nightRgb}87.5%`,
      `${nightRgb}100%`,
    ].map((s) => s.replace(/\s+/g, '').toLowerCase());

    // Each expected stop should appear in order in the actual gradient
    let searchIndex = 0;
    for (const stop of expectedStops) {
      const found = actual.indexOf(stop, searchIndex);
      expect(found).toBeGreaterThanOrEqual(searchIndex);
      searchIndex = found + 1;
    }

    errorSpy.mockRestore();
  });
});
