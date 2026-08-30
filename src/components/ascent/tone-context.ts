import { createContext, useContext } from 'react';
import type { ToneName } from '@/lib/tone';

/**
 * Read-only view of the live scene tones.
 *
 * Scene bands (ADR-0010) consume this to follow the backdrop tone instead of
 * being pinned to a static per-band tone. `tone` is the currently legible
 * tone for the *body* text family (flips at the body equal-legibility line,
 * ADR-0012); `softTone` is the same for the *muted* family (flips at its own
 * line). Only `TonalScene` (via the internal setter context) may publish flips.
 */
export interface SceneToneReadonly {
  tone: ToneName;
  softTone: ToneName;
}

/** Defaults to `carta` so scene bands outside a scene degrade to the ground tone. */
export const SceneToneContext = createContext<SceneToneReadonly>({
  tone: 'carta',
  softTone: 'carta',
});

/**
 * Internal setter context — only `TonalScene` should provide this.
 *
 * The tonal engine (`useTonalEngine`) publishes flips through these setters.
 * Under reduced motion the engine publishes both tones together at the body line.
 * Not exported for general consumption; prevents accidental tone overrides.
 */
export interface SceneToneSetter {
  setTone: (tone: ToneName) => void;
  setSoftTone: (tone: ToneName) => void;
}

export const SceneToneSetterContext = createContext<SceneToneSetter>({
  setTone: () => undefined,
  setSoftTone: () => undefined,
});

/**
 * The muted-text colour class for each scene tone (ADR-0011): `ink-soft`
 * (8.3:1 on carta) on daylight, `panna-dim` (4.8:1 on notte) after the
 * climb. Text that reads "secondary" while the backdrop blends uses this map
 * instead of a hardcoded class, so it never sits in an ink-family colour on a
 * notte backdrop.
 */
export const SCENE_SOFT_TEXT: Record<ToneName, string> = {
  carta: 'text-ink-soft',
  notte: 'text-panna-dim',
};

/** Reads the live scene tone (read-only); falls back to `carta` when no `TonalScene` is mounted. */
export function useSceneTone(): SceneToneReadonly {
  return useContext(SceneToneContext);
}

/** Internal hook for the tonal engine to publish flips. Not for general use. */
export function useSceneToneSetter(): SceneToneSetter {
  return useContext(SceneToneSetterContext);
}
