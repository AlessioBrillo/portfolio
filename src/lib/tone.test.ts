import { describe, expect, it } from 'vitest';
import {
  BODY_FLIP_LINE,
  SOFT_FLIP_LINE,
  SOFT_TEXT_TONE,
  TEXT_TONE,
  TONE,
  TONAL_TRANSITIONS,
  backdropColorAt,
  contrastRatio,
  flipLineFor,
  relativeLuminance,
} from '@/lib/tone';

describe('tonal constants', () => {
  it('exposes the committed paper and night hex values', () => {
    expect(TONE.paper).toBe('#F4F4F0');
    expect(TONE.night).toBe('#0A0A0A');
  });

  it('tunes the scene text family for the equal-legibility flip (ADR-0012)', () => {
    expect(TEXT_TONE.paper).toBe('#000000');
    expect(TEXT_TONE.night).toBe('#FFFFFF');
  });
});

describe('WCAG contrast helpers', () => {
  it('computes relative luminance per WCAG 2.1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
    expect(relativeLuminance(TONE.paper)).toBeGreaterThan(relativeLuminance(TONE.night));
  });

  it('keeps every committed-surface pair well past its floor', () => {
    // Body family on its own committed surfaces (ADR-0012): ink on paper,
    // cream on night.
    expect(contrastRatio(TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(15);
    expect(contrastRatio(TEXT_TONE.night, TONE.night)).toBeGreaterThanOrEqual(15);
    // Muted family on its own committed surfaces: AA on both.
    expect(contrastRatio(SOFT_TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(SOFT_TEXT_TONE.night, TONE.night)).toBeGreaterThanOrEqual(4.5);
    // Mosaic tiles: the body ink sits on the cream tile in both modes.
    expect(contrastRatio(TEXT_TONE.paper, TEXT_TONE.night)).toBeGreaterThanOrEqual(15);
  });
});

describe('backdropColorAt', () => {
  const climb = TONAL_TRANSITIONS[0];
  if (!climb) throw new Error('expected a climb transition');

  it('returns the committed tones at the fade ends', () => {
    expect(backdropColorAt(climb, 0)).toBe(TONE[climb.from]);
    expect(backdropColorAt(climb, 1)).toBe(TONE[climb.to]);
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
  const descent = TONAL_TRANSITIONS[1];
  if (!climb || !descent) throw new Error('expected a climb and a descent transition');

  it('places the body flip where both text tones are equally legible, clearing AA', () => {
    const bg = backdropColorAt(climb, BODY_FLIP_LINE.progress);
    const outgoing = contrastRatio(TEXT_TONE[climb.from], bg);
    const incoming = contrastRatio(TEXT_TONE[climb.to], bg);
    // The two ratios differ only by the 8-bit rounding of the blended
    // backdrop, so "equal" tolerates one rounding step.
    expect(Math.abs(outgoing - incoming)).toBeLessThan(0.1);
    expect(outgoing).toBeGreaterThanOrEqual(4.5);
    expect(incoming).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the body pair above AA at every blend fraction of both fades', () => {
    for (let i = 0; i <= 100; i += 1) {
      for (const transition of TONAL_TRANSITIONS) {
        const t = i / 100;
        const line = flipLineFor(TEXT_TONE, transition);
        const bg = backdropColorAt(transition, t);
        const tone = t < line.progress ? TEXT_TONE[transition.from] : TEXT_TONE[transition.to];
        const ratio = contrastRatio(tone, bg);
        expect(ratio, `${transition.from}->${transition.to} at ${t}`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('places the muted flip at its own line, past the body line', () => {
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThan(BODY_FLIP_LINE.progress);
    const bg = backdropColorAt(climb, SOFT_FLIP_LINE.progress);
    const outgoing = contrastRatio(SOFT_TEXT_TONE[climb.from], bg);
    const incoming = contrastRatio(SOFT_TEXT_TONE[climb.to], bg);
    expect(Math.abs(outgoing - incoming)).toBeLessThan(0.1);
  });

  it('bounds the muted pair above its documented floor at every blend fraction', () => {
    for (let i = 0; i <= 100; i += 1) {
      for (const transition of TONAL_TRANSITIONS) {
        const t = i / 100;
        const line = flipLineFor(SOFT_TEXT_TONE, transition);
        const bg = backdropColorAt(transition, t);
        const tone =
          t < line.progress ? SOFT_TEXT_TONE[transition.from] : SOFT_TEXT_TONE[transition.to];
        const ratio = contrastRatio(tone, bg);
        expect(ratio, `${transition.from}->${transition.to} at ${t}`).toBeGreaterThanOrEqual(1.5);
      }
    }
  });

  it('mirrors the flip lines for the descent, equal-legibility in both directions', () => {
    // The descent runs over the same window in the opposite direction, so
    // its equal-legibility colour is the climb's at the mirrored fraction.
    expect(flipLineFor(TEXT_TONE, descent).progress).toBeCloseTo(1 - BODY_FLIP_LINE.progress, 3);
    expect(flipLineFor(SOFT_TEXT_TONE, descent).progress).toBeCloseTo(
      1 - SOFT_FLIP_LINE.progress,
      3,
    );
    for (const [line, family] of [
      [flipLineFor(TEXT_TONE, descent), TEXT_TONE],
      [flipLineFor(SOFT_TEXT_TONE, descent), SOFT_TEXT_TONE],
    ] as const) {
      const bg = backdropColorAt(descent, line.progress);
      const outgoing = contrastRatio(family[descent.from], bg);
      const incoming = contrastRatio(family[descent.to], bg);
      expect(Math.abs(outgoing - incoming)).toBeLessThan(0.1);
    }
  });

  it('improves the muted worst case over the superseded midpoint flip', () => {
    const midpointBg = backdropColorAt(climb, 0.5);
    const midpointWorst = Math.min(
      contrastRatio(SOFT_TEXT_TONE[climb.from], midpointBg),
      contrastRatio(SOFT_TEXT_TONE[climb.to], midpointBg),
    );
    const flipBg = backdropColorAt(climb, SOFT_FLIP_LINE.progress);
    const flipWorst = Math.min(
      contrastRatio(SOFT_TEXT_TONE[climb.from], flipBg),
      contrastRatio(SOFT_TEXT_TONE[climb.to], flipBg),
    );
    expect(flipWorst).toBeGreaterThan(midpointWorst);
  });

  it('keeps the reduced-motion co-location safe for both text families', () => {
    // Under reduced motion there is no blend: backdrop and both text families
    // switch together at the body line, so each family's *committed* contrast
    // against its own tone is what holds -- not the blended midpoint.
    expect(contrastRatio(TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(TEXT_TONE.night, TONE.night)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(SOFT_TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(SOFT_TEXT_TONE.night, TONE.night)).toBeGreaterThanOrEqual(4.5);
  });

  it('renders flip positions inside the fade window', () => {
    expect(BODY_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
    expect(SOFT_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
    expect(BODY_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(BODY_FLIP_LINE.progress).toBeLessThan(1);
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(SOFT_FLIP_LINE.progress).toBeLessThan(1);
  });

  it('locks the flip progress snapshots that the e2e harness mirrors', () => {
    expect(BODY_FLIP_LINE.progress).toBeCloseTo(0.5406, 3);
    expect(SOFT_FLIP_LINE.progress).toBeCloseTo(0.5705, 3);
  });
});
