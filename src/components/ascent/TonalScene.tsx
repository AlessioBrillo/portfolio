import { useRef, type ReactElement, type ReactNode } from 'react';
import { TONE } from '@/lib/tone';
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
 * transition map lives in `@/lib/tone`. The backdrop starts on `paper` so there
 * is no flash before GSAP loads.
 */
export function TonalScene({ children }: TonalSceneProps): ReactElement {
  const backdropRef = useRef<HTMLDivElement>(null);
  useTonalEngine(backdropRef);

  return (
    <div className="relative">
      <div
        ref={backdropRef}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{ backgroundColor: TONE.paper }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
