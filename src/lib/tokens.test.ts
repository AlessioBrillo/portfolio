import { describe, it, expect } from 'vitest';
import { DURATION, EASE_OUT_EXPO, REVEAL_OFFSET_PX } from '@/lib/animation';
import { TONE } from '@/lib/tone';

/**
 * Verify JS motion and colour constants are internally consistent.
 *
 * These values must match the CSS custom properties in `src/index.css`:
 *
 *   --duration-fast: 150ms     →  DURATION.fast = 150
 *   --duration-normal: 300ms   →  DURATION.normal = 300
 *   --duration-slow: 600ms     →  DURATION.slow = 600
 *   --ease-out-expo: 0.16,1,0.3,1  →  EASE_OUT_EXPO = [0.16, 1, 0.3, 1]
 *   --color-paper: #F4EFE6     →  TONE.paper = '#F4EFE6'
 *   --color-night: #14161D     →  TONE.night = '#14161D'
 */
describe('design token sync (JS internal consistency)', () => {
  it('animation durations are positive', () => {
    expect(DURATION.fast).toBeGreaterThan(0);
    expect(DURATION.normal).toBeGreaterThan(DURATION.fast);
    expect(DURATION.slow).toBeGreaterThan(DURATION.normal);
  });

  it('easing curve has four components in [0, 1]', () => {
    expect(EASE_OUT_EXPO).toHaveLength(4);
    for (const v of EASE_OUT_EXPO) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('reveal offset is a small positive pixel value', () => {
    expect(REVEAL_OFFSET_PX).toBeGreaterThan(0);
    expect(REVEAL_OFFSET_PX).toBeLessThan(50);
  });

  it('TONE colours are valid hex strings', () => {
    expect(TONE.paper).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(TONE.night).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(TONE.paper).not.toBe(TONE.night);
  });
});
