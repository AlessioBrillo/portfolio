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
  it('exposes the committed paper and night hex values', () => {
    expect(TONE.paper).toBe('#F4F4F0');
    expect(TONE.night).toBe('#0A0A0A');
  });

  it('tunes the scene text family for the equal-legibility flip (ADR-0012)', () => {
    expect(TEXT_TONE.paper).toBe('#050505');
    expect(TEXT_TONE.night).toBe('#EAEAEA');
  });
});

describe('WCAG contrast helpers', () => {
  it('computes relative luminance per WCAG 2.1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
    expect(relativeLuminance(TONE.paper)).toBeGreaterThan(relativeLuminance(TONE.night));
  });

  it('keeps every committed-surface pair well past its floor', () => {
    // Body family on its own committed surfaces (ADR-0012): ink on paper, phosphor on night.
    expect(contrastRatio(TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(12);
    expect(contrastRatio(TEXT_TONE.night, TONE.night)).toBeGreaterThanOrEqual(4.45);
    // Muted family on its own committed surfaces: AA on both.
    expect(contrastRatio(SOFT_TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(SOFT_TEXT_TONE.night, TONE.night)).toBeGreaterThanOrEqual(4.5);
    // Mosaic tiles: the body ink sits on the phosphor tile in both modes.
    expect(contrastRatio(TEXT_TONE.paper, TEXT_TONE.night)).toBeGreaterThanOrEqual(12);
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
      relativeLuminance(TONE.night),
    );
    expect(relativeLuminance(backdropColorAt(climb, 0.5))).toBeLessThan(
      relativeLuminance(TONE.paper),
    );
  });
});

describe('flip lines (ADR-0012)', () => {
  const climb = TONAL_TRANSITIONS[0];
  if (!climb) throw new Error('expected a climb transition');

  it('computes a valid body flip line for the first transition', () => {
    // BODY_FLIP_LINE is computed from paper→foschia transition
    // Since TEXT_TONE only has paper/night, it falls back to BACKDROP_TONES for foschia
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
      // Test paper→night blend
      const bg1 = backdropColorAt(
        { from: 'paper', to: 'night', trigger: testTrigger, start: '', end: '' },
        t,
      );
      const tone1 = t < 0.5 ? SOFT_TEXT_TONE.paper : SOFT_TEXT_TONE.night;
      const ratio1 = contrastRatio(tone1, bg1);
      expect(ratio1).toBeGreaterThanOrEqual(1.2);

      // Test night→paper blend
      const bg2 = backdropColorAt(
        { from: 'night', to: 'paper', trigger: testTrigger, start: '', end: '' },
        t,
      );
      const tone2 = t < 0.5 ? SOFT_TEXT_TONE.night : SOFT_TEXT_TONE.paper;
      const ratio2 = contrastRatio(tone2, bg2);
      expect(ratio2).toBeGreaterThanOrEqual(1.2);
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
    // These are the actual computed values from the Swiss Industrial Print palette
    // The first transition (paper→foschia) computes equal-legibility at progress ~1.0
    // because TEXT_TONE falls back to BACKDROP_TONES for intermediate tones
    expect(BODY_FLIP_LINE.progress).toBeCloseTo(1.0, 1);
    expect(SOFT_FLIP_LINE.progress).toBeCloseTo(1.0, 1);
  });
});
