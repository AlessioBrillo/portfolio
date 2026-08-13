import { useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { TONE, type ToneName } from '@/lib/tone';
import { SceneToneContext } from './tone-context';
import { useTonalEngine } from './useTonalEngine';

interface TonalSceneProps {
  children: ReactNode;
}

/**
 * The flight's tonal backdrop: a single fixed surface whose colour flies from
 * `paper` (ground) up to `night` (cruise) and back down to `paper` (descent) as
 * the user scrolls. Wrapped sections must use `<Band surface="scene">` so the
 * backdrop shows through.
 *
 * Motion is owned by `useTonalEngine` (GSAP ScrollTrigger, ADR-0003); the
 * transition map lives in `@/lib/tone`. React only renders the seed colour --
 * once mounted, GSAP owns the backdrop element's paint, so the scene state
 * must never re-render it (that would snap the blend back to the seed). The
 * backdrop starts on `paper` so there is no flash before GSAP loads.
 *
 * The scene's current tone is published through `SceneToneContext` (ADR-0011):
 * scene bands read it for their text colour, so text stays legible while the
 * backdrop blends instead of sitting on a static per-band tone.
 *
 * **Stacking contract:** the backdrop must paint *behind all page content*,
 * not just behind the scene's own children. The wrapper divs carry no
 * `z-index`, so they do not create a stacking context -- the backdrop's
 * `z-index: -10` therefore resolves against the root stacking context, where
 * negative values paint above the body's paper background but below every
 * in-flow element. Scene bands (`surface="scene"`, transparent) show the
 * backdrop through them, while solid bands rendered *outside* the scene
 * (Contact, Footer) paint their own background over it -- without the
 * negative index, a `position: fixed; z-index: 0` backdrop paints above
 * static siblings and silently covers them (the night landing rendered as
 * paper; e2e `signature.e2e.ts` gates the composited result).
 */
export function TonalScene({ children }: TonalSceneProps): ReactElement {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<ToneName>('paper');
  useTonalEngine(backdropRef, setTone);

  return (
    <SceneToneContext.Provider value={{ tone, setTone }}>
      <div className="relative">
        <div
          ref={backdropRef}
          aria-hidden
          data-testid="tonal-backdrop"
          className="pointer-events-none fixed inset-0 -z-10"
          style={{ backgroundColor: TONE.paper }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </SceneToneContext.Provider>
  );
}
