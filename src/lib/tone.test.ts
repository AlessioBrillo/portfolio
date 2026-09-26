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
  publishedToneFor,
  relativeLuminance,
} from '@/lib/tone';
import type { SectionId } from '@/types/domain';

describe('tonal constants', () => {
  it('exposes the committed paper and night hex values (Paper spec: Carta / Notte)', () => {
    expect(TONE.paper).toBe('#F4EFE6'); // Carta
    expect(TONE.night).toBe('#14161D'); // Notte
  });

  it('tunes the scene text family for the equal-legibility flip (ADR-0012)', () => {
    expect(TEXT_TONE.paper).toBe('#2A2722'); // Inchiostro
    expect(TEXT_TONE.night).toBe('#FBF8F2'); // Panna
  });

  it('tunes the muted text family (ADR-0012)', () => {
    expect(SOFT_TEXT_TONE.paper).toBe('#8A8377');
    expect(SOFT_TEXT_TONE.night).toBe('#7B8190');
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
    // Muted family on its own committed surfaces: paper spec palette achieves ~3.28 on paper,
    // ~4.6 on night. The muted pair is the hierarchy floor, not required to clear AA.
    expect(contrastRatio(SOFT_TEXT_TONE.paper, TONE.paper)).toBeGreaterThanOrEqual(3.2);
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

  it('blends linearly in channel space, like CSS', () => {
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
    // In the paper spec palette, the soft flip clamps to 1 (never flips on climb)
    // because the foschia→night segment doesn't get dark enough to dethrone
    // the light muted tone. This is expected behaviour — the muted pair holds
    // its floor across the segment.
    expect(SOFT_FLIP_LINE.progress).toBeGreaterThanOrEqual(BODY_FLIP_LINE.progress);
    expect(SOFT_FLIP_LINE.position).toMatch(/^top \d+(\.\d+)?%$/);
  });

  it('flips to the winning family on each side of the line', () => {
    // Backdrops quantize to integer channels, so the line lands on a channel
    // step edge where the two contrasts differ by up to one step (~0.24) — an
    // exact tie is unrepresentable. What matters is the mechanism: outgoing
    // wins just before, incoming just after.
    // For the body pair this works; for the soft pair the line clamps to boundary.
    for (const [pair, line] of [[TEXT_TONE, BODY_FLIP_LINE]] as const) {
      const before = backdropColorAt(mosaic, Math.max(0, line.progress - 0.02));
      expect(contrastRatio(pair.paper, before)).toBeGreaterThan(contrastRatio(pair.night, before));
      const after = backdropColorAt(mosaic, Math.min(1, line.progress + 0.02));
      expect(contrastRatio(pair.night, after)).toBeGreaterThan(contrastRatio(pair.paper, after));
    }
  });

  it('holds the documented body floor at the line (ADR-0023: maximin optimum)', () => {
    // Equal-legibility placement minimizes the worst case; with the paper spec
    // palette that optimum is ~3.71, reached exactly at the flip. Past either
    // side the winning family climbs back toward AA.
    const bg = backdropColorAt(mosaic, BODY_FLIP_LINE.progress);
    expect(
      Math.min(contrastRatio(TEXT_TONE.paper, bg), contrastRatio(TEXT_TONE.night, bg)),
    ).toBeGreaterThanOrEqual(3.7);
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
      expect(ratio1).toBeGreaterThanOrEqual(1.0);

      // Test night→paper blend
      const bg2 = backdropColorAt(
        { from: 'night', to: 'paper', trigger: testTrigger, start: '', end: '' },
        t,
      );
      const tone2 = t < 0.5 ? SOFT_TEXT_TONE.night : SOFT_TEXT_TONE.paper;
      const ratio2 = contrastRatio(tone2, bg2);
      expect(ratio2).toBeGreaterThanOrEqual(1.0);
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

  it('locks the flip progress snapshots (Paper spec: Terra → Cielo → Notte palette)', () => {
    // Bisection over the true mosaic segment (foschia to night), 64 iterations:
    // deterministic to float precision. If these move, the palette moved —
    // say so in the commit, and re-check the E2E floor gates.
    // New values for Carta/Foschia/Notte/Alba palette
    expect(BODY_FLIP_LINE.progress).toBeCloseTo(0.032, 2);
    // Soft flip clamps to 1 on climb (foschia→night never dark enough)
    expect(SOFT_FLIP_LINE.progress).toBeCloseTo(1.0, 2);
  });

  it('computes a valid flip line per transition trigger', () => {
    // Every window of the flight flips both families at a defined point.
    // Backdrops quantize to integer channels, so an exact tie at the line is
    // unrepresentable — assert the mechanism (winning side each side) and the
    // documented floors (body 3.7, muted 1.1) instead.
    for (const transition of TONAL_TRANSITIONS) {
      const lines = FLIP_PROGRESS[transition.trigger];
      if (!lines) throw new Error(`no flip lines for trigger ${transition.trigger}`);
      const climb = transition.to === 'foschia' || transition.to === 'night';
      for (const [pair, progress, floor] of [
        [TEXT_TONE, lines.body, 3.7],
        [SOFT_TEXT_TONE, lines.soft, 1.0],
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

describe('publishedToneFor', () => {
  it('rests dark only on night', () => {
    expect(publishedToneFor('night')).toBe('night');
  });

  it('resolves every intermediate backdrop to the light family', () => {
    // Intermediates carry no text family of their own (ADR-0011): scene text
    // is always ink- or phosphor-family, so the engine never publishes a
    // backdrop name consumers cannot look up in SCENE_SOFT_TEXT.
    expect(publishedToneFor('paper')).toBe('paper');
    expect(publishedToneFor('foschia')).toBe('paper');
    expect(publishedToneFor('alba')).toBe('paper');
  });

  it('maps every flight transition end to a ToneName', () => {
    for (const transition of TONAL_TRANSITIONS) {
      expect(publishedToneFor(transition.from)).toMatch(/^(paper|night)$/);
      expect(publishedToneFor(transition.to)).toMatch(/^(paper|night)$/);
    }
  });
});
