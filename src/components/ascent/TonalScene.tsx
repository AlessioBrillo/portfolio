import { useRef, useState, useMemo, useEffect } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { TONE, type ToneName } from '@/lib/tone';
import { SceneToneContext, SceneToneSetterContext } from './tone-context';
import { useTonalEngine } from './useTonalEngine';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/** Subtle grain overlay (SVG noise, ~2.5% opacity) — breaks digital flatness without external assets. */
const GRAIN_SVG = `data:image/svg+xml;base64,${btoa(
  `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <filter id="noise">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" opacity="0.025"/>
  </svg>`,
)}`;

/** CRT scanline overlay — active only on night, disabled under reduced motion. */
const SCANLINE_SVG = `data:image/svg+xml;base64,${btoa(
  `<svg viewBox="0 0 100 4" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="scanlines" patternUnits="userSpaceOnUse" width="100" height="4">
        <rect x="0" y="0" width="100" height="2" fill="rgba(0,0,0,0.08)" />
        <rect x="0" y="2" width="100" height="2" fill="rgba(0,0,0,0.08)" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#scanlines)" />
  </svg>`,
)}`;

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
 * Texture layers (ADR-0021):
 * - Global mechanical noise (GRAIN_SVG) — always present
 * - CRT scanlines (SCANLINE_SVG) — only when tone === 'night', disabled under reduced motion
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
  const [engineError, setEngineError] = useState<Error | null>(null);
  const prefersReducedMotion = useReducedMotion();
  useTonalEngine(backdropRef, setTone, setSoftTone);

  useEffect(() => {
    function handleEngineError(
      event: CustomEvent<{ message: string; cause: unknown; stack?: string }>,
    ): void {
      setEngineError(new Error(event.detail.message, { cause: event.detail.cause }));
    }
    window.addEventListener('tonal-engine-error', handleEngineError as EventListener);
    return () =>
      window.removeEventListener('tonal-engine-error', handleEngineError as EventListener);
  }, []);

  const grainStyle = useMemo(
    () => ({
      backgroundImage: `url("${GRAIN_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '400px 400px',
      opacity: 1,
    }),
    [],
  );

  const scanlineStyle = useMemo(() => {
    if (prefersReducedMotion) return { display: 'none' };
    if (tone !== 'night') return { display: 'none' };
    return {
      backgroundImage: `url("${SCANLINE_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '100% 4px',
      opacity: 0.5,
    };
  }, [tone, prefersReducedMotion]);

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
            className="pointer-events-none fixed inset-0 -z-10"
            style={{ backgroundColor: TONE.paper }}
          />
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-5" style={grainStyle} />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-4"
            style={scanlineStyle}
          />
          <div className="relative z-10">{children}</div>
          {engineError && (
            <div
              role="status"
              aria-live="polite"
              className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-ink/95 backdrop-blur text-paper px-4 py-3 text-sm font-mono border border-orange/50"
            >
              Animation unavailable — static view active
            </div>
          )}
        </div>
      </SceneToneContext.Provider>
    </SceneToneSetterContext.Provider>
  );
}
