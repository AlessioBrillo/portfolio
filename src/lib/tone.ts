import type { SectionId } from '@/types/domain';

/**
 * Tonal model for the flight (the signature crossfade).
 *
 * This module holds the *declarative* description of the journey — the two
 * primary surfaces and the sequence of crossfades between them. The actual colour
 * interpolation (including the reduced-motion instant switch) is driven by
 * GSAP ScrollTrigger in `useTonalEngine` — see ADR-0003 (engine), ADR-0010
 * (flight profile) and ADR-0012 (equal-legibility flip lines). Colour mixing
 * happens only here, in the pure helpers used to compute the flip lines.
 */

/** All backdrop tones the flight uses (including intermediates). */
export const BACKDROP_TONES = {
  /** Newsprint — light substrate (ground) */
  paper: '#F4F4F0',
  /** Haze — intermediate climb tone */
  foschia: '#7A7A7A',
  /** Deactivated CRT — dark substrate (cruise/night) */
  night: '#0A0A0A',
  /** Dawn — intermediate descent tone */
  alba: '#858585',
} as const;

export type BackdropToneName = keyof typeof BACKDROP_TONES;

/** The two primary surfaces (for text tone families). */
export const TONE = {
  paper: BACKDROP_TONES.paper,
  night: BACKDROP_TONES.night,
} as const;

export type ToneName = keyof typeof TONE;

/**
 * The scene's body text family (ADR-0012): the ink-family colour that sits
 * on each committed backdrop tone, mirroring the CSS tokens `--color-ink` /
 * `--color-phosphor`. The two values are tuned so the equal-legibility flip
 * (see `flipLineFor`) clears WCAG AA (4.5:1) at every instant of the blend.
 */
export const TEXT_TONE = {
  paper: '#050505',
  night: '#EAEAEA',
} as const;

/**
 * The scene's muted text family (ADR-0012): `--color-ink-soft` /
 * `--color-phosphor-dim`. The pair is luminance-close by design — it is the
 * hero/body/muted hierarchy, not a defect — so its flip line bounds the
 * worst case to a documented floor instead of clearing AA.
 */
export const SOFT_TEXT_TONE = {
  paper: '#48453F',
  night: '#8D8D8D',
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
  from: BackdropToneName;
  to: BackdropToneName;
  start: string;
  end: string;
}

/**
 * The flight profile as a sequence of backdrop crossfades (ADR-0010):
 * climb (paper → foschia → night) into cruise, then descent (night → alba → paper)
 * back to daylight, finally night landing at Contact.
 *
 * `trigger` is the ScrollTrigger anchor — the section that fade flies *into*.
 */
export const TONAL_TRANSITIONS: readonly TonalTransition[] = [
  // Climb phase: ground → haze → night
  { trigger: 'who', from: 'paper', to: 'foschia', start: 'top bottom', end: 'top center' },
  { trigger: 'mosaic', from: 'foschia', to: 'night', start: 'top bottom', end: 'top center' },
  // Cruise holds night (no transition needed, AI & Physics and Work & School are on night)
  // Descent phase: night → dawn → paper
  { trigger: 'sky-sport', from: 'night', to: 'alba', start: 'top bottom', end: 'top center' },
  { trigger: 'experiences', from: 'alba', to: 'paper', start: 'top bottom', end: 'top center' },
  // Contact paints its own solid night outside TonalScene
] as const;

/**
 * Progress thresholds (0..1) for body and soft flips per transition trigger.
 * Computed once at module load from the declared palette.
 * Keys are the transition triggers (section IDs that drive each crossfade).
 *
 * The flip line is computed per transition over the transition's ACTUAL
 * backdrop blend (e.g. foschia → night) against the text tone family of the
 * flight phase (climb: ink → phosphor; descent: phosphor → ink). The text
 * tone family depends on flight phase, not on the immediate from/to names:
 * intermediate backdrop tones (foschia, alba) have no text family of their
 * own — scene text is always either the ink or the phosphor family.
 */
export const FLIP_PROGRESS: Record<string, { body: number; soft: number }> = (() => {
  const out: Record<string, { body: number; soft: number }> = {};
  for (const transition of TONAL_TRANSITIONS) {
    out[transition.trigger] = {
      body: flipLineFor(TEXT_TONE, transition).progress,
      soft: flipLineFor(SOFT_TEXT_TONE, transition).progress,
    };
  }
  return out;
})();

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
  const clean = hex.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
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
  const from = hexToRgb(BACKDROP_TONES[transition.from]);
  const to = hexToRgb(BACKDROP_TONES[transition.to]);
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
 * The line is computed per transition over the transition's ACTUAL backdrop
 * segment (transition.from → transition.to, exactly what GSAP paints). The
 * text pair follows the flight phase, not the segment names: a transition
 * flying toward night/foschia is climb (outgoing ink, incoming phosphor),
 * anything else is descent (outgoing phosphor, incoming ink). Intermediate
 * backdrop tones (foschia, alba) carry no text family — scene text is always
 * ink-family or phosphor-family.
 *
 * When the outgoing tone wins the whole segment the line clamps to 1 (flip
 * at the window end — e.g. the who window never gets dark enough to dethrone
 * ink); when the incoming tone already wins at the start it clamps to 0.
 *
 * The position string derives from the transition window geometry
 * (`top bottom` = heading top at 100% of the viewport, `top center` = 50%).
 */
export function flipLineFor(
  textTone: Readonly<Record<ToneName, string>>,
  transition: TonalTransition,
): FlipLine {
  const climb = transition.to === 'foschia' || transition.to === 'night';
  const outgoingText = textTone[climb ? 'paper' : 'night'];
  const incomingText = textTone[climb ? 'night' : 'paper'];
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 64; i += 1) {
    const mid = (lo + hi) / 2;
    const outgoing = contrastRatio(outgoingText, backdropColorAt(transition, mid));
    const incoming = contrastRatio(incomingText, backdropColorAt(transition, mid));
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
 * equal-legibility line of ink/phosphor over the mosaic window
 * (foschia → night), the segment where the backdrop actually gets dark enough
 * to dethrone ink — the who window never does (its line clamps to 1). The
 * reduced-motion discrete switch is anchored to the per-direction body line
 * of each transition (see FLIP_PROGRESS); this export names the climb's
 * decisive one. Worst case at the line (~4.1:1) is the documented body floor
 * (ADR-0023): the maximin optimum for this palette, not a defect.
 */
export const BODY_FLIP_LINE: FlipLine = flipLineFor(TEXT_TONE, TONAL_TRANSITIONS[1]!);

/**
 * Where the scene's *muted* text family flips on the climb (ADR-0012): the
 * equal-legibility line of ink-soft/phosphor-dim over the same segment,
 * which fires after the body line (its pair is luminance-close, so it can
 * afford to hold the light tone longer). Its worst case at the line (~1.7:1)
 * is the documented floor of the hierarchy; the descent mirrors it per
 * direction (sky-sport soft fires *before* its body line).
 */
export const SOFT_FLIP_LINE: FlipLine = flipLineFor(SOFT_TEXT_TONE, TONAL_TRANSITIONS[1]!);
