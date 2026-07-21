import type { SectionId } from '@/types/domain';

/**
 * Tonal model for the flight (the signature crossfade).
 *
 * This module holds the *declarative* description of the journey — the two
 * surfaces and the sequence of crossfades between them. The actual colour
 * interpolation (including the reduced-motion instant switch) is driven by
 * GSAP ScrollTrigger in `useTonalEngine` — see ADR-0003 (engine) and
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
 *
 * `trigger` is the ScrollTrigger anchor — the same section ADR-0010 narrates
 * as the band's target (e.g. the climb band is anchored to `mosaic`, but the
 * crossfade it drives is mechanically triggered by `ai-physics`, the section
 * that fade flies *into*). See docs/architecture/page-architecture.md.
 */
export const TONAL_TRANSITIONS: readonly TonalTransition[] = [
  { trigger: 'ai-physics', from: 'paper', to: 'night', start: 'top bottom', end: 'top center' },
  { trigger: 'sky-sport', from: 'night', to: 'paper', start: 'top bottom', end: 'top center' },
] as const;
