/**
 * Boundary math for the tonal flight (the signature crossfade).
 *
 * This module holds the *pure* logic only: clamping, mapping a global scroll
 * progress onto a single band's local progress, and the instant-switch decision
 * used under prefers-reduced-motion. The actual colour interpolation is left to
 * Framer Motion's battle-tested `useTransform` in `TonalScene` — we don't
 * reinvent colour mixing. See ADR-0010 (flight profile) and ADR-0003.
 */

/** The two surfaces the first transition crossfades between. */
export const TONE = {
  paper: '#F4EFE6',
  night: '#14161D',
} as const;

export type ToneName = keyof typeof TONE;

/**
 * Framer Motion input stops for the ground -> cruise crossfade, expressed as
 * fractions of the scene's own scroll progress. The tone holds `paper` through
 * the ground sections, fades across the cloud deck, then holds `night`.
 */
export const FADE_STOPS = [0, 0.62, 0.82, 1] as const;

/** The progress at which the reduced-motion instant switch flips to night. */
export const FADE_MIDPOINT = 0.72;

/** Clamp a number into the [0, 1] range. */
export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

/**
 * Map a global progress in [0, 1] onto a single band that occupies
 * [start, end]. Returns 0 before the band, 1 after it, and a linear ramp
 * inside. A zero-width band degrades to a hard step at the boundary.
 */
export function bandProgress(progress: number, start: number, end: number): number {
  if (end <= start) return progress >= end ? 1 : 0;
  return clamp01((progress - start) / (end - start));
}

/**
 * The instant (non-interpolated) tone for a given progress — used under
 * prefers-reduced-motion, where the crossfade collapses to a single switch.
 */
export function toneAt(progress: number, threshold: number = FADE_MIDPOINT): ToneName {
  return progress >= threshold ? 'night' : 'paper';
}
