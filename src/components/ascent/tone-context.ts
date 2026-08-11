import { createContext, useContext } from 'react';
import type { ToneName } from '@/lib/tone';

/**
 * The live tone of the `TonalScene` backdrop.
 *
 * `TonalScene` owns the state and feeds it from the tonal engine; scene bands
 * (ADR-0010) read it so their text colour follows the backdrop instead of
 * being pinned to a static per-band tone. `tone` is the currently legible
 * tone; `setTone` lets the engine publish flips (see `useTonalEngine`).
 */
export interface SceneToneValue {
  tone: ToneName;
  setTone: (tone: ToneName) => void;
}

/** Defaults to `paper` so scene bands outside a scene degrade to the ground tone. */
export const SceneToneContext = createContext<SceneToneValue>({
  tone: 'paper',
  setTone: () => undefined,
});

/** Reads the live scene tone; falls back to `paper` when no `TonalScene` is mounted. */
export function useSceneTone(): SceneToneValue {
  return useContext(SceneToneContext);
}
