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
    const paperRgb = hexToRgb(BACKDROP_TONES.paper);
    const foschiaRgb = hexToRgb(BACKDROP_TONES.foschia);
    const nightRgb = hexToRgb(BACKDROP_TONES.night);
    const albaRgb = hexToRgb(BACKDROP_TONES.alba);

    expect(gradient).toContain(paperRgb);
    expect(gradient).toContain(foschiaRgb);
    expect(gradient).toContain(nightRgb);
    expect(gradient).toContain(albaRgb);

    // Verify order: paper -> foschia -> night -> alba -> paper -> night
    const paperIndex = gradient.indexOf(paperRgb);
    const foschiaIndex = gradient.indexOf(foschiaRgb);
    const nightIndex = gradient.indexOf(nightRgb);
    const albaIndex = gradient.indexOf(albaRgb);

    expect(paperIndex).toBeLessThan(foschiaIndex);
    expect(foschiaIndex).toBeLessThan(nightIndex);
    expect(nightIndex).toBeLessThan(albaIndex);

    // alba should appear before the final paper/night sequence
    const lastPaperIndex = gradient.lastIndexOf(paperRgb);
    const lastNightIndex = gradient.lastIndexOf(nightRgb);
    expect(albaIndex).toBeLessThan(lastPaperIndex);
    expect(lastPaperIndex).toBeLessThan(lastNightIndex);

    errorSpy.mockRestore();
  });
});
