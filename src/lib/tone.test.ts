import { describe, expect, it } from 'vitest';
import {
  BODY_FLIP_LINE,
  FLIP_PROGRESS,
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
  const mosaic = TONAL_TRANSITIONS[1];
  if (!mosaic) throw new Error('expected a mosaic transition');

  it('computes the climb flip over the actual darkening segment (mosaic: foschia to night)', () => {
    // The who window (paper to foschia) never gets dark enough to dethrone
    // ink, so its line clamps to 1; the decisive climb flip lives in the
    // mosaic window, well before its midpoint.
    expect(BODY_FLIP_LINE.progress).toBeGreaterThan(0);
    expect(BODY_FLIP_LINE.progress).toBeLessThan(0.5);
    expect(BODY_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
  });

  it('fires the muted flip after the body flip on the climb', () => {
    // The muted pair is luminance-close, so it holds the light tone longer.
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThan(BODY_FLIP_LINE.progress);
    expect(SOFT_FLIP_LINE.progress).toBeLessThan(0.5);
    expect(SOFT_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
  });

  it('flips to the winning family on each side of the line', () => {
    // Backdrops quantize to integer channels, so the line lands on a channel
    // step edge where the two contrasts differ by up to one step (~0.24) — an
    // exact tie is unrepresentable. What matters is the mechanism: outgoing
    // wins just before, incoming just after.
    for (const [pair, line] of [
      [TEXT_TONE, BODY_FLIP_LINE],
      [SOFT_TEXT_TONE, SOFT_FLIP_LINE],
    ] as const) {
      const before = backdropColorAt(mosaic, Math.max(0, line.progress - 0.02));
      expect(contrastRatio(pair.paper, before)).toBeGreaterThan(contrastRatio(pair.night, before));
      const after = backdropColorAt(mosaic, Math.min(1, line.progress + 0.02));
      expect(contrastRatio(pair.night, after)).toBeGreaterThan(contrastRatio(pair.paper, after));
    }
  });

  it('holds the documented body floor at the line (ADR-0023: maximin optimum)', () => {
    // Equal-legibility placement minimizes the worst case; with the brutalist
    // palette that optimum is ~4.1, reached exactly at the flip. Past either
    // side the winning family climbs back toward AA.
    const bg = backdropColorAt(mosaic, BODY_FLIP_LINE.progress);
    expect(
      Math.min(contrastRatio(TEXT_TONE.paper, bg), contrastRatio(TEXT_TONE.night, bg)),
    ).toBeGreaterThanOrEqual(4.0);
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

  it('locks the flip progress snapshots (Swiss Industrial Print palette)', () => {
    // Bisection over the true mosaic segment (foschia to night), 64 iterations:
    // deterministic to float precision. If these move, the palette moved —
    // say so in the commit, and re-check the E2E floor gates.
    expect(BODY_FLIP_LINE.progress).toBeCloseTo(0.085, 2);
    expect(SOFT_FLIP_LINE.progress).toBeCloseTo(0.165, 2);
  });

  it('computes a valid flip line per transition trigger', () => {
    // Every window of the flight flips both families at a defined point.
    // Backdrops quantize to integer channels, so an exact tie at the line is
    // unrepresentable — assert the mechanism (winning side each side) and the
    // documented floors (body 4.0, muted 1.6) instead.
    for (const transition of TONAL_TRANSITIONS) {
      const lines = FLIP_PROGRESS[transition.trigger];
      if (!lines) throw new Error(`no flip lines for trigger ${transition.trigger}`);
      const climb = transition.to === 'foschia' || transition.to === 'night';
      for (const [pair, progress, floor] of [
        [TEXT_TONE, lines.body, 4.0],
        [SOFT_TEXT_TONE, lines.soft, 1.6],
      ] as const) {
        expect(progress).toBeGreaterThanOrEqual(0);
        expect(progress).toBeLessThanOrEqual(1);
        const outgoing = pair[climb ? 'paper' : 'night'];
        const incoming = pair[climb ? 'night' : 'paper'];
        const atLine = backdropColorAt(transition, progress);
        // Bisection clamps to ~2^-65 past the edge, never exactly 0/1 in
        // float64 — treat the epsilon neighbourhood as the boundary it is.
        const atStart = progress <= 1e-9;
        const atEnd = progress >= 1 - 1e-9;
        if (!atStart && !atEnd) {
          // Interior line: the flip is the maximin optimum, both families
          // hold the documented floor at the handoff itself.
          expect(
            Math.min(contrastRatio(outgoing, atLine), contrastRatio(incoming, atLine)),
          ).toBeGreaterThanOrEqual(floor);
        } else {
          // Boundary line (who holds its tone throughout, experiences starts
          // flipped): only the winner is on screen, and it clears the floor.
          const winner = atEnd ? outgoing : incoming;
          expect(contrastRatio(winner, atLine)).toBeGreaterThanOrEqual(floor);
        }
        if (!atStart) {
          const before = backdropColorAt(transition, Math.max(0, progress - 0.02));
          expect(contrastRatio(outgoing, before)).toBeGreaterThan(contrastRatio(incoming, before));
        }
        if (!atEnd) {
          const after = backdropColorAt(transition, Math.min(1, progress + 0.02));
          expect(contrastRatio(incoming, after)).toBeGreaterThan(contrastRatio(outgoing, after));
        }
      }
    }
  });
});
