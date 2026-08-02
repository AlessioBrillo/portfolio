import { useEffect, useState } from 'react';
import { flightPositionAt, type FlightAnchors } from '@/lib/altitude';
import { useScrollProgress } from '@/hooks/useScrollProgress';

/**
 * Measures each profile anchor's position as a fraction of total scroll
 * progress (0..1). Sections missing from the DOM or a non-scrollable page
 * collapse to ground level — the gauge then reads 0, which is safe.
 */
function measureAnchors(): FlightAnchors {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const at = (id: string): number => {
    const el = document.getElementById(id);
    if (!el || scrollable <= 0) return 0;
    const top = el.getBoundingClientRect().top + window.scrollY;
    return Math.min(1, Math.max(0, top / scrollable));
  };
  return { ground: at('hero'), cruise: at('ai-physics'), night: at('contact') };
}

/**
 * The flight's current altitude (0..1) on the rise-and-fall gauge profile.
 * Raw page progress comes from `useScrollProgress`; anchor positions are
 * re-measured on resize and window load so layout shifts stay reflected.
 */
export function useAltitudeProfile(): number {
  const progress = useScrollProgress();
  const [anchors, setAnchors] = useState<FlightAnchors>(measureAnchors);

  useEffect(() => {
    const update = (): void => setAnchors(measureAnchors());
    window.addEventListener('resize', update);
    window.addEventListener('load', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('load', update);
    };
  }, []);

  return flightPositionAt(progress, anchors);
}
