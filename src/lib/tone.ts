import type { SectionId } from '@/types/domain';

/**
 * Tonal model for the flight (the signature crossfade).
 *
 * This module holds the *declarative* description of the journey plus the pure
 * boundary helpers (clamping, single-band progress, the instant-switch decision
 * used under prefers-reduced-motion). The actual colour interpolation is driven
 * by GSAP ScrollTrigger in `useTonalEngine` — see ADR-0003 (engine) and
 * ADR-0010 (flight profile). We keep no colour mixing here.
 */

/** The two surfaces the flight crossfades between. */
export const TONE = {
  paper: '#F4EFE6',
  night: '#14161D',
} as const;

export type ToneName = keyof typeof TONE;

/**
 * One scroll-driven crossfade of the backdrop, anchored to a real section.
 * The fade runs as `trigger` scrolls through the window; `start`/`end` are
 * GSAP ScrollTrigger positions (tuned so the fade completes as the section
 * reaches centre, keeping each section's text on its correct, AA-legible tone).
 */
export interface TonalTransition {
  /** id of the `Band` section whose scroll-through drives this crossfade */
  trigger: SectionId;
  from: ToneName;
  to: ToneName;
  start: string;
  end: string;
}

/**
 * The flight profile as a sequence of backdrop crossfades (ADR-0010):
 * climb (paper → night) into cruise, then descent (night → paper) back to
 * daylight. The backdrop holds the last tone between transitions; Contact
 * paints its own solid night outside the scene.
 */
export const TONAL_TRANSITIONS: readonly TonalTransition[] = [
  { trigger: 'ai-physics', from: 'paper', to: 'night', start: 'top bottom', end: 'top center' },
  { trigger: 'sky-sport', from: 'night', to: 'paper', start: 'top bottom', end: 'top center' },
] as const;

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
