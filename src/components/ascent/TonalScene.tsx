import { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { TONE, type ToneName } from '@/lib/tone';
import { SceneToneContext, SceneToneSetterContext } from './tone-context';
import { useTonalEngine } from './useTonalEngine';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useForcedColors } from '@/hooks/useForcedColors';

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

/** Constellation overlay — easter egg: press ↑ on night to reveal a subtle star field. */
const CONSTELLATION_SVG = `data:image/svg+xml;base64,${btoa(
  `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#FBF8F2" stop-opacity="1"/>
        <stop offset="60%" stop-color="#FBF8F2" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#FBF8F2" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <!-- Major stars (brighter, larger) -->
    <circle cx="120" cy="85" r="2.5" fill="url(#starGlow)" opacity="0.9"/>
    <circle cx="340" cy="45" r="2" fill="url(#starGlow)" opacity="0.85"/>
    <circle cx="580" cy="95" r="2.2" fill="url(#starGlow)" opacity="0.88"/>
    <circle cx="720" cy="160" r="1.8" fill="url(#starGlow)" opacity="0.8"/>
    <circle cx="95" cy="220" r="2.8" fill="url(#starGlow)" opacity="0.95"/>
    <circle cx="420" cy="190" r="1.5" fill="url(#starGlow)" opacity="0.75"/>
    <circle cx="650" cy="180" r="2" fill="url(#starGlow)" opacity="0.82"/>
    <circle cx="280" cy="310" r="1.8" fill="url(#starGlow)" opacity="0.78"/>
    <circle cx="510" cy="285" r="2.3" fill="url(#starGlow)" opacity="0.88"/>
    <circle cx="760" cy="340" r="1.6" fill="url(#starGlow)" opacity="0.7"/>
    <circle cx="180" cy="410" r="2.1" fill="url(#starGlow)" opacity="0.85"/>
    <circle cx="390" cy="380" r="1.9" fill="url(#starGlow)" opacity="0.8"/>
    <circle cx="620" cy="420" r="2.4" fill="url(#starGlow)" opacity="0.9"/>
    <circle cx="70" cy="520" r="1.7" fill="url(#starGlow)" opacity="0.72"/>
    <circle cx="480" cy="490" r="2" fill="url(#starGlow)" opacity="0.82"/>
    <circle cx="730" cy="480" r="1.8" fill="url(#starGlow)" opacity="0.75"/>
    <!-- Minor stars (smaller, dimmer) -->
    <circle cx="200" cy="60" r="0.8" fill="#FBF8F2" opacity="0.5"/>
    <circle cx="290" cy="110" r="0.6" fill="#FBF8F2" opacity="0.45"/>
    <circle cx="460" cy="70" r="0.7" fill="#FBF8F2" opacity="0.48"/>
    <circle cx="520" cy="130" r="0.5" fill="#FBF8F2" opacity="0.4"/>
    <circle cx="680" cy="110" r="0.6" fill="#FBF8F2" opacity="0.42"/>
    <circle cx="150" cy="180" r="0.7" fill="#FBF8F2" opacity="0.45"/>
    <circle cx="370" cy="160" r="0.5" fill="#FBF8F2" opacity="0.4"/>
    <circle cx="590" cy="210" r="0.8" fill="#FBF8F2" opacity="0.5"/>
    <circle cx="240" cy="250" r="0.6" fill="#FBF8F2" opacity="0.42"/>
    <circle cx="440" cy="240" r="0.5" fill="#FBF8F2" opacity="0.38"/>
    <circle cx="690" cy="260" r="0.7" fill="#FBF8F2" opacity="0.45"/>
    <circle cx="110" cy="340" r="0.5" fill="#FBF8F2" opacity="0.38"/>
    <circle cx="330" cy="350" r="0.7" fill="#FBF8F2" opacity="0.42"/>
    <circle cx="560" cy="320" r="0.6" fill="#FBF8F2" opacity="0.4"/>
    <circle cx="780" cy="380" r="0.5" fill="#FBF8F2" opacity="0.35"/>
    <circle cx="260" cy="440" r="0.7" fill="#FBF8F2" opacity="0.4"/>
    <circle cx="420" cy="460" r="0.5" fill="#FBF8F2" opacity="0.38"/>
    <circle cx="670" cy="450" r="0.6" fill="#FBF8F2" opacity="0.4"/>
    <circle cx="40" cy="560" r="0.5" fill="#FBF8F2" opacity="0.35"/>
    <circle cx="520" cy="540" r="0.7" fill="#FBF8F2" opacity="0.42"/>
    <circle cx="790" cy="510" r="0.5" fill="#FBF8F2" opacity="0.35"/>
  </svg>`,
)}`;

interface TonalSceneProps {
  children: ReactNode;
}

/**
 * The flight's tonal backdrop: a single fixed surface whose colour flies from
 * `carta` (ground) up to `notte` (cruise) and back down through `alba` to `carta`
 * (descent) as the user scrolls. Contact paints its own solid notte outside the scene.
 *
 * Motion is owned by `useTonalEngine` (GSAP ScrollTrigger, ADR-0003); the
 * transition map lives in `@/lib/tone`. React only renders the seed colour --
 * once mounted, GSAP owns the backdrop element's paint, so the scene state
 * must never re-render it (that would snap the blend back to the seed). The
 * backdrop starts on `carta` so there is no flash before GSAP loads.
 *
 * The scene's current tone is published through `SceneToneContext` (ADR-0011):
 * scene bands read it for their text colour, so text stays legible while the
 * backdrop blends instead of sitting on a static per-band tone.
 *
 * Texture layers:
 * - Global mechanical noise (GRAIN_SVG) — always present
 * - CRT scanlines (SCANLINE_SVG) — only when tone === 'notte', disabled under reduced motion
 * - Constellation (CONSTELLATION_SVG) — easter egg: press ↑ on notte to reveal
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
  const [tone, setTone] = useState<ToneName>('carta');
  const [softTone, setSoftTone] = useState<ToneName>('carta');
  const [engineError, setEngineError] = useState<Error | null>(null);
  const [showConstellation, setShowConstellation] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const prefersForcedColors = useForcedColors();
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

  // Constellation easter egg: press ArrowUp on notte to reveal star field
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp' && tone === 'notte' && !prefersReducedMotion) {
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

  const grainStyle = useMemo(() => {
    if (prefersForcedColors) return { display: 'none' };
    return {
      backgroundImage: `url("${GRAIN_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '400px 400px',
      opacity: 1,
    };
  }, [prefersForcedColors]);

  const scanlineStyle = useMemo(() => {
    if (prefersReducedMotion) return { display: 'none' };
    if (prefersForcedColors) return { display: 'none' };
    if (tone !== 'notte') return { display: 'none' };
    return {
      backgroundImage: `url("${SCANLINE_SVG}")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '100% 4px',
      opacity: 0.5,
    };
  }, [tone, prefersReducedMotion, prefersForcedColors]);

  const constellationStyle = useMemo(() => {
    if (!showConstellation) return { display: 'none' };
    if (prefersReducedMotion) return { display: 'none' };
    if (prefersForcedColors) return { display: 'none' };
    if (tone !== 'notte') return { display: 'none' };
    return {
      backgroundImage: `url("${CONSTELLATION_SVG}")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center center',
      backgroundSize: 'cover',
      opacity: 0.15,
      animation: 'constellationFade 8s ease-out forwards',
    };
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
            className="pointer-events-none fixed inset-0 -z-10"
            style={{ backgroundColor: TONE.carta }}
          />
          <div aria-hidden className="pointer-events-none fixed inset-0 -z-5" style={grainStyle} />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-4"
            style={scanlineStyle}
          />
          <div
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-3"
            style={constellationStyle}
          />
          <div className="relative z-10">{children}</div>
          {engineError && (
            <div
              role="status"
              aria-live="polite"
              className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-ink/95 backdrop-blur text-carta px-4 py-3 text-sm font-mono border border-accent/50"
            >
              Animation unavailable — static view active
            </div>
          )}
        </div>
      </SceneToneContext.Provider>
    </SceneToneSetterContext.Provider>
  );
}
