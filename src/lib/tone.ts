import type { SectionId } from '@/types/domain';

/**
 * Tonal model for the flight (the signature crossfade).
 *
 * This module holds the *declarative* description of the journey — the two
 * surfaces and the sequence of crossfades between them. The actual colour
 * interpolation (including the reduced-motion instant switch) is driven by
 * GSAP ScrollTrigger in `useTonalEngine` — see ADR-0003 (engine), ADR-0010
 * (flight profile) and ADR-0012 (equal-legibility flip lines). Colour mixing
 * happens only here, in the pure helpers used to compute the flip lines.
 */

/** The two surfaces the flight crossfades between. */
export const TONE = {
  paper: '#F4EFE6',
  night: '#14161D',
} as const;

export type ToneName = keyof typeof TONE;

/**
 * The scene's body text family (ADR-0012): the ink-family colour that sits
 * on each committed backdrop tone, mirroring the CSS tokens `--color-ink` /
 * `--color-cream`. The two values are tuned so the equal-legibility flip
 * (see `flipLineFor`) clears WCAG AA (4.5:1) at every instant of the blend.
 */
export const TEXT_TONE = {
  paper: '#000000',
  night: '#FFFDF6',
} as const;

/**
 * The scene's muted text family (ADR-0012): `--color-ink-soft` /
 * `--color-muted-dark`. The pair is luminance-close by design — it is the
 * hero/body/muted hierarchy, not a defect — so its flip line bounds the
 * worst case to a documented floor instead of clearing AA.
 */
export const SOFT_TEXT_TONE = {
  paper: '#48453F',
  night: '#7B8190',
} as const;

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

/** The scroll position at which a scene text family flips while the backdrop blends. */
export interface FlipLine {
  /** Blend fraction (0..1) of the fade window at which the flip fires. */
  progress: number;
  /**
   * Equivalent ScrollTrigger position (`top <pct>%` of the trigger heading).
   * The heading travels `top bottom` (100%) -> `top center` (50%) across the
   * fade, so the flip's viewport percentage is `100 - 50 * progress`.
   */
  position: string;
}

function hexToRgb(hex: string): readonly [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function linearize(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance of an `#RRGGBB` colour, per WCAG 2.1. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

/** WCAG 2.1 contrast ratio between two `#RRGGBB` colours (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la >= lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The backdrop colour at blend fraction `progress` of a transition — linear
 * interpolation in sRGB channels, exactly what GSAP paints every frame, so
 * computed flip lines match the rendered blend.
 */
export function backdropColorAt(transition: TonalTransition, progress: number): string {
  const from = hexToRgb(TONE[transition.from]);
  const to = hexToRgb(TONE[transition.to]);
  const rgb = from.map((v, i) => Math.round(v + (to[i]! - v) * progress));
  return `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

/**
 * The blend fraction where the two text tones of a pair are *equally
 * legible* against the live backdrop — past that point the incoming tone is
 * strictly more legible (ADR-0012). Bisection on the signed contrast
 * difference, which is strictly decreasing across the fade: the outgoing
 * tone loses legibility as the backdrop approaches the incoming tone.
 *
 * The line is computed per transition: the climb and the descent run over
 * the same scroll window in opposite directions, so at any shared scroll
 * geometry the backdrop has blended *different* amounts (the descent at
 * progress `t` is the mirror of the climb at `1 - t`). A single shared
 * position would flip the descent at the climb's equal-legibility colour
 * and strand the outgoing tone below AA for the whole second half of the
 * fade — the defect the per-direction line exists to prevent.
 *
 * The position string derives from the transition window geometry
 * (`top bottom` = heading top at 100% of the viewport, `top center` = 50%).
 */
export function flipLineFor(
  textTone: Readonly<Record<ToneName, string>>,
  transition: TonalTransition,
): FlipLine {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const outgoing = contrastRatio(textTone[transition.from], backdropColorAt(transition, mid));
    const incoming = contrastRatio(textTone[transition.to], backdropColorAt(transition, mid));
    if (outgoing > incoming) {
      lo = mid;
    } else {
      hi = mid;
    }
  }
  const progress = (lo + hi) / 2;
  return { progress, position: `top ${(100 - 50 * progress).toFixed(3)}%` };
}

/**
 * Where the scene's *body* text family flips on the climb (ADR-0012): the
 * equal-legibility line of ink/cream, tuned so both tones clear 4.5:1 at the
 * line itself. The descent mirrors it (see `flipLineFor`); the engine
 * computes the per-direction line for each transition. The reduced-motion
 * discrete switch is anchored to the same per-direction body line.
 */
export const BODY_FLIP_LINE: FlipLine = flipLineFor(TEXT_TONE, TONAL_TRANSITIONS[0]!);

/**
 * Where the scene's *muted* text family flips on the climb (ADR-0012): the
 * equal-legibility line of ink-soft/muted-dark, which fires after the body
 * line (its pair is luminance-close, so it can afford to hold the light tone
 * longer). Its worst case at the line (~1.57:1) is the documented floor of
 * the hierarchy; the descent mirrors it per direction.
 */
export const SOFT_FLIP_LINE: FlipLine = flipLineFor(SOFT_TEXT_TONE, TONAL_TRANSITIONS[0]!);
