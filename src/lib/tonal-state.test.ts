import { describe, expect, it } from 'vitest';
import { TONAL_TRANSITIONS } from '@/lib/flight-profile';
import { BACKDROP_TONES, FLIP_PROGRESS, backdropColorAt } from '@/lib/tone';
import { tonalStateAt, windowProgress, type TriggerTops } from '@/lib/tonal-state';

const VH = 1000;
const [WHO, MOSAIC, SKY, EXPERIENCES] = TONAL_TRANSITIONS;

/** Viewport `top` of a trigger that sits at `progress` through its window. */
function topAt(progress: number): number {
  return VH - progress * (VH / 2);
}

/** All triggers below the fold, then overrides. */
function tops(overrides: TriggerTops = {}): TriggerTops {
  return { who: 9e3, mosaic: 9e3, 'sky-sport': 9e3, experiences: 9e3, ...overrides };
}

describe('windowProgress', () => {
  it('is 0 until the trigger top reaches the viewport bottom', () => {
    expect(windowProgress(VH, VH)).toBe(0);
    expect(windowProgress(VH + 400, VH)).toBe(0);
  });

  it('is 1 once the trigger top reaches the viewport centre', () => {
    expect(windowProgress(VH / 2, VH)).toBe(1);
    expect(windowProgress(-300, VH)).toBe(1);
  });

  it('is linear between top-bottom and top-center', () => {
    expect(windowProgress(topAt(0.25), VH)).toBeCloseTo(0.25, 10);
    expect(windowProgress(topAt(0.8), VH)).toBeCloseTo(0.8, 10);
  });
});

describe('tonalStateAt (full motion)', () => {
  it('rests on paper on the ground, before any window opens', () => {
    expect(tonalStateAt(tops(), VH, false)).toEqual({
      color: BACKDROP_TONES.paper.toUpperCase(),
      tone: 'paper',
      softTone: 'paper',
    });
  });

  it('blends paper -> foschia through the who window', () => {
    const state = tonalStateAt(tops({ who: topAt(0.5) }), VH, false);
    expect(state.color).toBe(backdropColorAt(WHO!, 0.5));
  });

  it('holds foschia between the who and mosaic windows', () => {
    const state = tonalStateAt(tops({ who: 0 }), VH, false);
    expect(state.color).toBe(BACKDROP_TONES.foschia.toUpperCase());
  });

  it('blends foschia -> night through the mosaic window, not a hard step', () => {
    const state = tonalStateAt(tops({ who: 0, mosaic: topAt(0.5) }), VH, false);
    expect(state.color).toBe(backdropColorAt(MOSAIC!, 0.5));
    expect(state.color).not.toBe(BACKDROP_TONES.foschia.toUpperCase());
    expect(state.color).not.toBe(BACKDROP_TONES.night.toUpperCase());
  });

  it('flips body text to night exactly at the mosaic body line', () => {
    const line = FLIP_PROGRESS.mosaic!.body;
    const before = tonalStateAt(tops({ who: 0, mosaic: topAt(line - 0.01) }), VH, false);
    const after = tonalStateAt(tops({ who: 0, mosaic: topAt(line + 0.01) }), VH, false);
    expect(before.tone).toBe('paper');
    expect(after.tone).toBe('night');
  });

  it('flips muted text on its own line, distinct from the body line', () => {
    const { body, soft } = FLIP_PROGRESS.mosaic!;
    expect(soft).not.toBeCloseTo(body, 3);
    const between = (body + soft) / 2;
    const state = tonalStateAt(tops({ who: 0, mosaic: topAt(between) }), VH, false);
    // Each family is on opposite sides of its own line at this progress.
    expect(state.tone === 'night').toBe(between >= body);
    expect(state.softTone === 'night').toBe(between >= soft);
    expect(state.tone).not.toBe(state.softTone);
  });

  it('cruises on night with night text once every climb window is done', () => {
    expect(tonalStateAt(tops({ who: 0, mosaic: 0 }), VH, false)).toEqual({
      color: BACKDROP_TONES.night.toUpperCase(),
      tone: 'night',
      softTone: 'night',
    });
  });

  it('descends night -> alba -> paper through sky-sport and experiences', () => {
    const climbed = { who: 0, mosaic: 0 };
    expect(tonalStateAt(tops({ ...climbed, 'sky-sport': topAt(0.5) }), VH, false).color).toBe(
      backdropColorAt(SKY!, 0.5),
    );
    expect(tonalStateAt(tops({ ...climbed, 'sky-sport': 0 }), VH, false).color).toBe(
      BACKDROP_TONES.alba.toUpperCase(),
    );
    expect(
      tonalStateAt(tops({ ...climbed, 'sky-sport': 0, experiences: topAt(0.5) }), VH, false).color,
    ).toBe(backdropColorAt(EXPERIENCES!, 0.5));
  });

  it('lands back on paper with paper text after the experiences window', () => {
    expect(
      tonalStateAt(tops({ who: 0, mosaic: 0, 'sky-sport': 0, experiences: 0 }), VH, false),
    ).toEqual({ color: BACKDROP_TONES.paper.toUpperCase(), tone: 'paper', softTone: 'paper' });
  });

  it('treats a trigger missing from the page as not yet reached', () => {
    expect(tonalStateAt({ who: 0 }, VH, false).color).toBe(BACKDROP_TONES.foschia.toUpperCase());
  });
});

describe('tonalStateAt (reduced motion)', () => {
  it('never paints an in-between colour: only committed tones', () => {
    const committed = new Set(Object.values(BACKDROP_TONES).map((hex) => hex.toUpperCase()));
    for (let p = 0; p <= 1; p += 0.05) {
      const state = tonalStateAt(tops({ who: 0, mosaic: topAt(p) }), VH, true);
      expect(committed.has(state.color), `mosaic ${p.toFixed(2)} -> ${state.color}`).toBe(true);
    }
  });

  it('switches the backdrop at the body line and publishes the same tone', () => {
    const line = FLIP_PROGRESS.mosaic!.body;
    const before = tonalStateAt(tops({ who: 0, mosaic: topAt(line - 0.01) }), VH, true);
    const after = tonalStateAt(tops({ who: 0, mosaic: topAt(line + 0.01) }), VH, true);
    expect(before.color).toBe(BACKDROP_TONES.foschia.toUpperCase());
    expect(after.color).toBe(BACKDROP_TONES.night.toUpperCase());
    expect(before.tone).toBe('paper');
    expect(after.tone).toBe('night');
    expect(after.softTone).toBe('night');
  });

  it('matches full motion once every window is complete', () => {
    const done = tops({ who: 0, mosaic: 0, 'sky-sport': 0, experiences: 0 });
    expect(tonalStateAt(done, VH, true)).toEqual(tonalStateAt(done, VH, false));
  });
});
