import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { type ToneName } from '@/lib/tone';
import { SceneToneContext, SceneToneSetterContext } from './tone-context';
import { useSceneTonePublisher } from '@/hooks/useSceneTonePublisher';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useForcedColors } from '@/hooks/useForcedColors';

interface TonalSceneProps {
  children: ReactNode;
}

/**
 * The flight's tonal backdrop: a single fixed surface whose colour flies from
 * `paper` (ground) up to `night` (cruise) and back down through `alba` to `paper`
 * (descent) as the user scrolls. Contact paints its own solid night outside the scene.
 *
 * The blend is driven by `useSceneTonePublisher` (ADR-0026), which maps each
 * transition trigger's scroll position to the backdrop colour; the transition
 * map lives in `@/lib/flight-profile`. React only renders the seed colour --
 * once mounted, the engine owns the backdrop element's paint, so the scene state
 * must never re-render it (that would snap the blend back to the seed). The
 * backdrop starts on `paper` (CSS seed) so there is no flash before JS runs.
 *
 * The scene's current tone is published through `SceneToneContext` (ADR-0011):
 * scene bands read it for their text colour, so text stays legible while the
 * backdrop blends instead of sitting on a static per-band tone.
 *
 * Texture layers:
 * - Global mechanical noise (--grain-svg CSS custom property) — always present
 * - CRT scanlines (--scanline-svg) — only when tone === 'night', disabled under reduced motion
 * - Constellation (--constellation-svg) — easter egg: press ↑ on night to reveal
 * **Stacking contract:** the backdrop must paint *behind all page content*,
 * not just behind the scene's own children. The wrapper divs carry no
 * `z-index`, so they do not create a stacking context -- the backdrop's
 * `z-index: -10` therefore resolves against the root stacking context, where
 * negative values paint above the body's paper background but below every
 * in-flow element. Scene bands (`surface="scene"`, transparent) show the
 * backdrop through them, while solid bands rendered *outside* the scene
 * (Contact, Footer) paint their own background over it.
 */
export function TonalScene({ children }: TonalSceneProps): ReactElement {
  const backdropRef = useRef<HTMLDivElement>(null);
  const [tone, setTone] = useState<ToneName>('paper');
  const [softTone, setSoftTone] = useState<ToneName>('paper');
  const [showConstellation, setShowConstellation] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const prefersForcedColors = useForcedColors();

  useSceneTonePublisher({
    backdropRef,
    onToneChange: setTone,
    onSoftToneChange: setSoftTone,
  });

  // Constellation easter egg: press ArrowUp on night to reveal star field
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' && tone === 'night' && !prefersReducedMotion) {
        setShowConstellation(true);
        // Auto-hide after 8 seconds
        setTimeout(() => setShowConstellation(false), 8000);
      }
    },
    [tone, prefersReducedMotion],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Texture layer styles now use CSS custom properties defined in flight.css
  // The inline styles are only for conditional display logic
  const scanlineStyle = useMemo(() => {
    if (prefersReducedMotion) return { display: 'none' as const };
    if (prefersForcedColors) return { display: 'none' as const };
    if (tone !== 'night') return { display: 'none' as const };
    return { display: 'block' as const };
  }, [tone, prefersReducedMotion, prefersForcedColors]);

  const constellationStyle = useMemo(() => {
    if (!showConstellation) return { display: 'none' as const };
    if (prefersReducedMotion) return { display: 'none' as const };
    if (prefersForcedColors) return { display: 'none' as const };
    if (tone !== 'night') return { display: 'none' as const };
    return { display: 'block' as const };
  }, [showConstellation, tone, prefersReducedMotion, prefersForcedColors]);

  const readonlyValue = useMemo(() => ({ tone, softTone }), [tone, softTone]);
  const setterValue = useMemo(() => ({ setTone, setSoftTone }), [setTone, setSoftTone]);

  return (
    <SceneToneSetterContext.Provider value={setterValue}>
      <SceneToneContext.Provider value={readonlyValue}>
        <div className="relative">
          <div
            ref={backdropRef}
            aria-hidden
            data-testid="tonal-backdrop"
            data-tonal-backdrop="root"
            className="flight-backdrop pointer-events-none fixed inset-0 -z-10"
          />
          <div aria-hidden className="flight-grain pointer-events-none fixed inset-0 -z-5" />
          <div
            aria-hidden
            className={`flight-scanlines pointer-events-none fixed inset-0 -z-4 ${scanlineStyle.display === 'block' ? 'flight-scanlines--active' : ''}`}
          />
          <div
            aria-hidden
            className={`flight-constellation pointer-events-none fixed inset-0 -z-3 ${showConstellation ? 'flight-constellation--visible' : ''}`}
            style={constellationStyle}
          />
          <div className="relative z-10">{children}</div>
        </div>
      </SceneToneContext.Provider>
    </SceneToneSetterContext.Provider>
  );
}
