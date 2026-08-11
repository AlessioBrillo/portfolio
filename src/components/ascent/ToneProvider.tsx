import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { ToneName } from '@/lib/tone';
import { SceneToneContext } from './tone-context';

interface ToneProviderProps {
  children: ReactNode;
  /** The tone children observe before the engine publishes its first flip. */
  initialTone?: ToneName;
}

/**
 * Provides the live scene tone to bands rendered on a `TonalScene` backdrop.
 * Exists so tests can mount a scene tone without the GSAP engine.
 */
export function ToneProvider({ children, initialTone = 'paper' }: ToneProviderProps): ReactElement {
  const [tone, setTone] = useState<ToneName>(initialTone);
  return (
    <SceneToneContext.Provider value={{ tone, setTone }}>{children}</SceneToneContext.Provider>
  );
}
