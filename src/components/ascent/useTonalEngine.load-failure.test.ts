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
    const cartaRgb = hexToRgb(BACKDROP_TONES.carta);
    const foschiaRgb = hexToRgb(BACKDROP_TONES.foschia);
    const notteRgb = hexToRgb(BACKDROP_TONES.notte);
    const albaRgb = hexToRgb(BACKDROP_TONES.alba);

    expect(gradient).toContain(cartaRgb);
    expect(gradient).toContain(foschiaRgb);
    expect(gradient).toContain(notteRgb);
    expect(gradient).toContain(albaRgb);

    // Verify order: carta -> foschia -> notte -> alba -> carta -> notte
    const cartaIndex = gradient.indexOf(cartaRgb);
    const foschiaIndex = gradient.indexOf(foschiaRgb);
    const notteIndex = gradient.indexOf(notteRgb);
    const albaIndex = gradient.indexOf(albaRgb);

    expect(cartaIndex).toBeLessThan(foschiaIndex);
    expect(foschiaIndex).toBeLessThan(notteIndex);
    expect(notteIndex).toBeLessThan(albaIndex);

    // alba should appear before the final carta/notte sequence
    const lastCartaIndex = gradient.lastIndexOf(cartaRgb);
    const lastNotteIndex = gradient.lastIndexOf(notteRgb);
    expect(albaIndex).toBeLessThan(lastCartaIndex);
    expect(lastCartaIndex).toBeLessThan(lastNotteIndex);

    errorSpy.mockRestore();
  });
});
