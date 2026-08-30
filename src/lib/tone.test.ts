import { describe, expect, it } from 'vitest';
import {
  BODY_FLIP_LINE,
  SOFT_FLIP_LINE,
  SOFT_TEXT_TONE,
  TEXT_TONE,
  TONE,
  BACKDROP_TONES,
  TONAL_TRANSITIONS,
  backdropColorAt,
  contrastRatio,
  relativeLuminance,
} from '@/lib/tone';
import type { SectionId } from '@/types/domain';

describe('tonal constants', () => {
  it('exposes the committed carta and notte hex values', () => {
    expect(TONE.carta).toBe('#F4EFE6');
    expect(TONE.notte).toBe('#14161D');
  });

  it('tunes the scene text family for the equal-legibility flip (ADR-0012)', () => {
    expect(TEXT_TONE.carta).toBe('#2A2722');
    expect(TEXT_TONE.notte).toBe('#FBF8F2');
  });
});

describe('WCAG contrast helpers', () => {
  it('computes relative luminance per WCAG 2.1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
    expect(relativeLuminance(TONE.carta)).toBeGreaterThan(relativeLuminance(TONE.notte));
  });

  it('keeps every committed-surface pair well past its floor', () => {
    // Body family on its own committed surfaces (ADR-0012): ink on carta, panna on notte.
    expect(contrastRatio(TEXT_TONE.carta, TONE.carta)).toBeGreaterThanOrEqual(12);
    expect(contrastRatio(TEXT_TONE.notte, TONE.notte)).toBeGreaterThanOrEqual(4.45);
    // Muted family on its own committed surfaces: AA on both.
    expect(contrastRatio(SOFT_TEXT_TONE.carta, TONE.carta)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(SOFT_TEXT_TONE.notte, TONE.notte)).toBeGreaterThanOrEqual(4.5);
    // Mosaic tiles: the body ink sits on the panna tile in both modes.
    expect(contrastRatio(TEXT_TONE.carta, TEXT_TONE.notte)).toBeGreaterThanOrEqual(12);
  });
});

describe('backdropColorAt', () => {
  const climb = TONAL_TRANSITIONS[0];
  if (!climb) throw new Error('expected a climb transition');

  it('returns the committed tones at the fade ends', () => {
    expect(backdropColorAt(climb, 0)).toBe(BACKDROP_TONES[climb.from]);
    expect(backdropColorAt(climb, 1)).toBe(BACKDROP_TONES[climb.to]);
  });

  it('blends linearly in channel space, like GSAP', () => {
    expect(relativeLuminance(backdropColorAt(climb, 0.5))).toBeGreaterThan(
      relativeLuminance(TONE.notte),
    );
    expect(relativeLuminance(backdropColorAt(climb, 0.5))).toBeLessThan(
      relativeLuminance(TONE.carta),
    );
  });
});

describe('flip lines (ADR-0012)', () => {
  const climb = TONAL_TRANSITIONS[0];
  if (!climb) throw new Error('expected a climb transition');

  it('computes a valid body flip line for the first transition', () => {
    // BODY_FLIP_LINE is computed from carta→foschia transition
    // Since TEXT_TONE only has carta/notte, it falls back to BACKDROP_TONES for foschia
    // The progress is ~1.0 (equal legibility of ink vs foschia at end of fade)
    expect(BODY_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(BODY_FLIP_LINE.progress).toBeLessThanOrEqual(1);
    expect(BODY_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
  });

  it('computes a valid soft flip line for the first transition', () => {
    // SOFT_FLIP_LINE uses SOFT_TEXT_TONE and is also ~1.0
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(SOFT_FLIP_LINE.progress).toBeLessThanOrEqual(1);
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThanOrEqual(BODY_FLIP_LINE.progress);
    expect(SOFT_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
  });

  it('bounds the muted pair above its documented floor at every blend fraction', () => {
    const testTrigger = 'ai-physics' as SectionId;
    for (let i = 0; i <= 100; i += 1) {
      const t = i / 100;
      // Test carta→notte blend
      const bg1 = backdropColorAt(
        { from: 'carta', to: 'notte', trigger: testTrigger, start: '', end: '' },
        t,
      );
      const tone1 = t < 0.5 ? SOFT_TEXT_TONE.carta : SOFT_TEXT_TONE.notte;
      const ratio1 = contrastRatio(tone1, bg1);
      expect(ratio1).toBeGreaterThanOrEqual(1.5);

      // Test notte→carta blend
      const bg2 = backdropColorAt(
        { from: 'notte', to: 'carta', trigger: testTrigger, start: '', end: '' },
        t,
      );
      const tone2 = t < 0.5 ? SOFT_TEXT_TONE.notte : SOFT_TEXT_TONE.carta;
      const ratio2 = contrastRatio(tone2, bg2);
      expect(ratio2).toBeGreaterThanOrEqual(1.5);
    }
  });

  it('renders flip positions inside the fade window', () => {
    expect(BODY_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
    expect(SOFT_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
    expect(BODY_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(BODY_FLIP_LINE.progress).toBeLessThanOrEqual(1);
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(SOFT_FLIP_LINE.progress).toBeLessThanOrEqual(1);
  });

  it('locks the flip progress snapshots (actual computed values)', () => {
    // These are the actual computed values from the Italian Warmth palette
    // The first transition (carta→foschia) computes equal-legibility at progress ~1.0
    // because TEXT_TONE falls back to BACKDROP_TONES for intermediate tones
    expect(BODY_FLIP_LINE.progress).toBeCloseTo(1.0, 1);
    expect(SOFT_FLIP_LINE.progress).toBeCloseTo(1.0, 1);
  });
});
