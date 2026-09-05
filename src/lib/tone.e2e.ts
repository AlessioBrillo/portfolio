/**
 * E2E verification constants — only used by Playwright tests.
 *
 * Kept separate from `tone.ts` so the production bundle does not include
 * test-only verification data (flip progress maps, rendered tone values).
 */
import { FLIP_PROGRESS } from './tone';

/**
 * Maps the section ID scrolled to for verification
 * to the transition trigger that governs the fade ending at that section.
 * Used by the Playwright harness to look up the correct flip lines.
 * - 'ai-physics' verifies the climb's final state (mosaic transition: foschia -> night)
 * - 'sky-sport' verifies the descent's final state (sky-sport transition: night -> alba)
 */
export const E2E_FLIP_PROGRESS: Record<string, { body: number; soft: number }> = {
  'ai-physics': FLIP_PROGRESS.mosaic!,
  'sky-sport': FLIP_PROGRESS['sky-sport']!,
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

/** Verification sections: 'ai-physics' for climb, 'sky-sport' for descent. */
export const TRANSITION_TRIGGERS = ['ai-physics', 'sky-sport'] as const;

/** Expected heading tones before/after body flip for each transition trigger. */
export const EXPECTED_HEADING: Record<string, { before: string; after: string }> = {
  'ai-physics': { before: RENDERED_TEXT_TONES.paper, after: RENDERED_TEXT_TONES.night },
  'sky-sport': { before: RENDERED_TEXT_TONES.night, after: RENDERED_TEXT_TONES.paper },
};

/** Expected muted tones for full motion at body/soft flip points. */
export const MUTED_EXPECTED_FULL_MOTION: Record<string, { beforeBody: string; afterSoft: string }> =
  {
    'ai-physics': {
      beforeBody: RENDERED_MUTED_TONES.paper, // at body+0.01 (0.5506), soft not flipped yet (flips at 0.5705)
      afterSoft: RENDERED_MUTED_TONES.night, // past soft line (0.5705+0.05), flipped to night
    },
    'sky-sport': {
      beforeBody: RENDERED_MUTED_TONES.paper, // at body-0.01 (0.4494), soft already flipped (flipped at 0.4295) to PAPER
      afterSoft: RENDERED_MUTED_TONES.paper, // past soft line (0.4295+0.05), still paper
    },
  };

/** Expected muted tones for reduced motion at body/soft flip points. */
export const MUTED_EXPECTED_REDUCED_MOTION: Record<
  string,
  { beforeBody: string; afterSoft: string }
> = {
  'ai-physics': {
    beforeBody: RENDERED_MUTED_TONES.night, // at body+0.01 (past body line), both flip to night
    afterSoft: RENDERED_MUTED_TONES.night, // past soft line, still night
  },
  'sky-sport': {
    beforeBody: RENDERED_MUTED_TONES.night, // at body-0.01 (before body line), still night (coming from night)
    afterSoft: RENDERED_MUTED_TONES.paper, // past body line (same as soft in reduced), flipped to paper
  },
};
