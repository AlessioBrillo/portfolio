import { createContext, useContext } from 'react';
import type { ToneName } from '@/lib/tone';

/**
 * The live tones of the `TonalScene` backdrop.
 *
 * `TonalScene` owns the state and feeds it from the tonal engine; scene bands
 * (ADR-0010) read it so their text colour follows the backdrop instead of
 * being pinned to a static per-band tone. `tone` is the currently legible
 * tone for the *body* text family (flips at the body equal-legibility line,
 * ADR-0012); `softTone` is the same for the *muted* family (flips at its own
 * line). The `setTone`/`setSoftTone` setters let the engine publish flips
 * (see `useTonalEngine`); under reduced motion the engine publishes both
 * tones together at the body line.
 */
export interface SceneToneValue {
  tone: ToneName;
  setTone: (tone: ToneName) => void;
  softTone: ToneName;
  setSoftTone: (tone: ToneName) => void;
}

/** Defaults to `paper` so scene bands outside a scene degrade to the ground tone. */
export const SceneToneContext = createContext<SceneToneValue>({
  tone: 'paper',
  setTone: () => undefined,
  softTone: 'paper',
  setSoftTone: () => undefined,
});

/**
 * The muted-text colour class for each scene tone (ADR-0011): `ink-soft`
 * (8.3:1 on paper) on daylight, `muted-dark` (4.8:1 on night) after the
 * climb. Text that reads "secondary" while the backdrop blends uses this map
 * instead of a hardcoded class, so it never sits in an ink-family colour on a
 * night backdrop.
 */
export const SCENE_SOFT_TEXT: Record<ToneName, string> = {
  paper: 'text-ink-soft',
  night: 'text-muted-dark',
};

/** Reads the live scene tone; falls back to `paper` when no `TonalScene` is mounted. */
export function useSceneTone(): SceneToneValue {
  return useContext(SceneToneContext);
}
