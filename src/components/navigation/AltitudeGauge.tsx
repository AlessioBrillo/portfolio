import type { ReactElement } from 'react';
import { ALTITUDE_STOPS } from '@/lib/altitude';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { cn } from '@/lib/utils';

/**
 * The navigation IS the metaphor (ADR-0006): a vertical altitude gauge that
 * fills as you climb. No hamburger, no classic menu. On mobile this is meant to
 * collapse into a thin top progress bar (roadmap Phase 3) — here it is a
 * desktop-only scaffold that already reflects real scroll progress.
 */
export function AltitudeGauge(): ReactElement {
  const progress = useScrollProgress();
  const activeIndex = Math.min(
    ALTITUDE_STOPS.length - 1,
    Math.floor(progress * ALTITUDE_STOPS.length),
  );

  const goTo = (sectionId: string): void => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Altitude navigation"
      className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex"
    >
      {ALTITUDE_STOPS.map((stop, index) => (
        <button
          key={stop.band}
          type="button"
          onClick={() => goTo(stop.target)}
          aria-current={index === activeIndex ? 'true' : undefined}
          className={cn(
            'font-mono text-[0.6875rem] uppercase tracking-[0.18em] transition-colors',
            index === activeIndex ? 'text-orange' : 'text-muted-light hover:text-ink',
          )}
        >
          {stop.label}
        </button>
      ))}
    </nav>
  );
}
