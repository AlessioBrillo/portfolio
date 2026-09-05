/**
 * E2E verification constants — only used by Playwright tests.
 *
 * Kept separate from `tone.ts` so the production bundle does not include
 * test-only verification data (flip progress maps, rendered tone values).
 */
import { FLIP_PROGRESS } from './tone';

/**
 * Flip lines per real transition trigger — the section each fade flies into
 * (`TONAL_TRANSITIONS` in tone.ts). The harness scrolls a trigger's own
 * heading through its own window, so lines and scroll anchor share one
 * coordinate system. (A past revision mapped verification sections to other
 * triggers' lines and failed every gate — never do that again.)
 */
export const E2E_FLIP_PROGRESS: Record<string, { body: number; soft: number }> = {
  who: FLIP_PROGRESS.who!,
  mosaic: FLIP_PROGRESS.mosaic!,
  'sky-sport': FLIP_PROGRESS['sky-sport']!,
  experiences: FLIP_PROGRESS.experiences!,
} as const;

/** Actual rendered text tones (from CSS tokens / tone-context): ink on paper, phosphor on night. */
export const RENDERED_TEXT_TONES = {
  paper: 'rgb(5, 5, 5)',
  night: 'rgb(234, 234, 234)',
} as const;

/** Actual rendered muted tones: ink-soft on paper, phosphor-dim on night. */
export const RENDERED_MUTED_TONES = {
  paper: 'rgb(72, 69, 63)',
  night: 'rgb(141, 141, 141)',
} as const;

/** Density of the blend-fraction sweep (0.05 .. 0.95, step 0.1, plus both flip lines +/- 0.03). */
export const SWEEP_STEP = 0.1;

/** Margin around flip lines for before/after sampling — increased for soft flip due to scroll positioning variance. */
export const SOFT_FLIP_MARGIN = 0.05;

/** WCAG AA contrast threshold for normal text. */
export const AA_NORMAL_TEXT = 4.5;

/** WCAG AA contrast threshold for large text. */
export const AA_LARGE_TEXT = 3;

/** Bounded floor for the muted family at its own flip line (ADR-0012). */
export const MUTED_FLOOR = 1.2;

/**
 * Body floor near a flip line (ADR-0023). Equal-legibility placement is the
 * maximin optimum, and with the brutalist palette that optimum is ~4.06 —
 * so within a small window around each body flip the gate is 4.0, and 4.5
 * everywhere else. Large-text AA (3.0) holds with margin throughout.
 */
export const BODY_NEAR_FLIP_FLOOR = 4.0;

/**
 * Blend distance around a body flip where the near-flip floor replaces AA.
 * Past the line the winning family climbs back toward AA gradually (4.5 is
 * recovered ~0.065 past the line), so the window covers recovery plus
 * scroll-positioning variance. Samples outside it gate strict AA.
 */
export const BODY_FLIP_WINDOW = 0.08;

/** Verification windows: every crossfade of the flight. */
export const TRANSITION_TRIGGERS = ['who', 'mosaic', 'sky-sport', 'experiences'] as const;

/**
 * Windows with interior flips, verified for exact before/after tones. The
 * who window holds ink throughout (line at the edge) and the experiences
 * window starts flipped (line at the edge) — both covered by the sweep and
 * the committed-ends tests instead.
 */
export const FLIP_VERIFY_TRIGGERS = ['mosaic', 'sky-sport'] as const;

/** Expected heading tones before/after the body flip of each interior window. */
export const EXPECTED_HEADING: Record<string, { before: string; after: string }> = {
  mosaic: { before: RENDERED_TEXT_TONES.paper, after: RENDERED_TEXT_TONES.night },
  'sky-sport': { before: RENDERED_TEXT_TONES.night, after: RENDERED_TEXT_TONES.paper },
};

/** Expected muted tones for full motion at body/soft flip points. */
export const MUTED_EXPECTED_FULL_MOTION: Record<string, { beforeBody: string; afterSoft: string }> =
  {
    mosaic: {
      beforeBody: RENDERED_MUTED_TONES.paper, // at body+0.01, soft (0.165) not flipped yet
      afterSoft: RENDERED_MUTED_TONES.night, // past soft line + margin, flipped to night
    },
    'sky-sport': {
      beforeBody: RENDERED_MUTED_TONES.paper, // at body-0.01, soft (0.760) already flipped to paper
      afterSoft: RENDERED_MUTED_TONES.paper, // past soft line + margin, still paper
    },
  };

/** Expected muted tones for reduced motion at body/soft flip points. */
export const MUTED_EXPECTED_REDUCED_MOTION: Record<
  string,
  { beforeBody: string; afterSoft: string }
> = {
  mosaic: {
    beforeBody: RENDERED_MUTED_TONES.paper, // at body-0.01, pre-flip
    afterSoft: RENDERED_MUTED_TONES.night, // past body line + margin (both flip at body), night
  },
  'sky-sport': {
    beforeBody: RENDERED_MUTED_TONES.night, // at body-0.01, pre-flip, still night
    afterSoft: RENDERED_MUTED_TONES.paper, // past body line + margin, flipped to paper
  },
};
