import { describe, expect, it } from 'vitest';
import { bandProgress, clamp01, FADE_STOPS, TONE, toneAt } from '@/lib/tone';

describe('clamp01', () => {
  it('passes values already inside [0, 1] through unchanged', () => {
    expect(clamp01(0.42)).toBe(0.42);
  });

  it('clamps values below 0 up to 0', () => {
    expect(clamp01(-3)).toBe(0);
  });

  it('clamps values above 1 down to 1', () => {
    expect(clamp01(2.5)).toBe(1);
  });
});

describe('bandProgress', () => {
  it('returns 0 before the band starts', () => {
    expect(bandProgress(0.1, 0.5, 0.8)).toBe(0);
  });

  it('returns 1 after the band ends', () => {
    expect(bandProgress(0.95, 0.5, 0.8)).toBe(1);
  });

  it('maps the midpoint of the band to 0.5', () => {
    expect(bandProgress(0.65, 0.5, 0.8)).toBeCloseTo(0.5);
  });

  it('treats a zero-width band as a hard step at the boundary', () => {
    expect(bandProgress(0.49, 0.5, 0.5)).toBe(0);
    expect(bandProgress(0.5, 0.5, 0.5)).toBe(1);
  });
});

describe('toneAt', () => {
  it('is the ground tone below the threshold (reduced-motion instant switch)', () => {
    expect(toneAt(0.3)).toBe('paper');
  });

  it('is the cruise tone at or above the threshold', () => {
    expect(toneAt(0.75)).toBe('night');
  });

  it('honours a custom threshold', () => {
    expect(toneAt(0.6, 0.8)).toBe('paper');
    expect(toneAt(0.8, 0.8)).toBe('night');
  });
});

describe('tonal constants', () => {
  it('exposes the committed paper and night hex values', () => {
    expect(TONE.paper).toBe('#F4EFE6');
    expect(TONE.night).toBe('#14161D');
  });

  it('defines four monotonic, in-range fade stops', () => {
    expect(FADE_STOPS).toHaveLength(4);
    const sorted = [...FADE_STOPS].sort((a, b) => a - b);
    expect(FADE_STOPS).toEqual(sorted);
    expect(FADE_STOPS[0]).toBeGreaterThanOrEqual(0);
    expect(FADE_STOPS[FADE_STOPS.length - 1]).toBeLessThanOrEqual(1);
  });
});
