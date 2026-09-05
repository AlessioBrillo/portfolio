import { useState, useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { ToneName } from '@/lib/tone';
import { SceneToneContext, SceneToneSetterContext } from './tone-context';

interface ToneProviderProps {
  children: ReactNode;
  /** The tone children observe before the engine publishes its first flip. */
  initialTone?: ToneName;
  /**
   * The muted-family tone; defaults to `initialTone`, which is correct in
   * production (both start on the ground tone) and keeps existing tests
   * unchanged. Only tests that need to observe the body/muted split set it
   * independently.
   */
  initialSoftTone?: ToneName;
}

/**
 * Provides the live scene tones to bands rendered on a `TonalScene` backdrop.
 * Exists so tests can mount a scene tone without the GSAP engine.
 */
export function ToneProvider({
  children,
  initialTone = 'paper',
  initialSoftTone,
}: ToneProviderProps): ReactElement {
  const [tone, setTone] = useState<ToneName>(initialTone);
  const [softTone, setSoftTone] = useState<ToneName>(initialSoftTone ?? initialTone);
  const readonlyValue = useMemo(() => ({ tone, softTone }), [tone, softTone]);
  const setterValue = useMemo(() => ({ setTone, setSoftTone }), [setTone, setSoftTone]);

  return (
    <SceneToneSetterContext.Provider value={setterValue}>
      <SceneToneContext.Provider value={readonlyValue}>{children}</SceneToneContext.Provider>
    </SceneToneSetterContext.Provider>
  );
}
