import { TONAL_TRANSITIONS } from '@/lib/flight-profile';
import {
  BACKDROP_TONES,
  FLIP_PROGRESS,
  backdropColorAt,
  publishedToneFor,
  type ToneName,
} from '@/lib/tone';

/** Viewport `top` (px) of each transition trigger, keyed by section id. */
export type TriggerTops = Readonly<Record<string, number>>;

export interface TonalState {
  /** Backdrop colour as `#RRGGBB`. */
  color: string;
  /** Published tone for the scene's body text. */
  tone: ToneName;
  /** Published tone for the scene's muted text. */
  softTone: ToneName;
}

/**
 * How far a trigger has travelled through its fade window (0..1): 0 while its
 * top is at or below the viewport bottom, 1 once it reaches the viewport
 * centre (`top bottom` -> `top center`, see `TONAL_TRANSITIONS`).
 */
export function windowProgress(top: number, viewportHeight: number): number {
  const progress = (viewportHeight - top) / (viewportHeight / 2);
  return Math.min(1, Math.max(0, progress));
}

/**
 * The whole tonal state of the flight for one scroll position — a pure
 * function of where each trigger sits in the viewport (ADR-0026).
 *
 * Transitions are applied in flight order: every completed window commits its
 * `to` tone, the first open window blends, and later windows have not begun.
 * Scene text flips where `FLIP_PROGRESS` says each family becomes less legible
 * than its replacement (ADR-0012). Under reduced motion nothing blends: the
 * backdrop and both text families switch together at the body line.
 */
export function tonalStateAt(
  tops: TriggerTops,
  viewportHeight: number,
  reducedMotion: boolean,
): TonalState {
  const first = TONAL_TRANSITIONS[0]!;
  let color = BACKDROP_TONES[first.from].toUpperCase();
  let tone = publishedToneFor(first.from);
  let softTone = tone;

  for (const transition of TONAL_TRANSITIONS) {
    const progress = windowProgress(tops[transition.trigger] ?? Infinity, viewportHeight);
    const lines = FLIP_PROGRESS[transition.trigger]!;
    const incoming = publishedToneFor(transition.to);

    if (reducedMotion) {
      if (progress < lines.body) break;
      color = BACKDROP_TONES[transition.to].toUpperCase();
      tone = incoming;
      softTone = incoming;
      continue;
    }

    if (progress > 0) color = backdropColorAt(transition, progress);
    if (progress >= lines.body) tone = incoming;
    if (progress >= lines.soft) softTone = incoming;
    if (progress < 1) break;
  }

  return { color, tone, softTone };
}
