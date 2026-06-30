import type { ReactElement } from 'react';
import { ALTITUDE_STOPS, SECTION_ORDER } from '@/lib/altitude';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/types/domain';

/**
 * The navigation IS the metaphor (ADR-0006): a vertical altitude gauge driven
 * by IntersectionObserver per `useCurrentSection`. Each altitude stop targets a
 * section element; the gauge lights the matching stop orange when that section
 * occupies the most viewport real estate. Sections without a dedicated stop
 * map to the nearest previous stop.
 *
 * On mobile this collapses into a thin top progress bar (roadmap Phase 3).
 */
const TARGETS = ALTITUDE_STOPS.map((s) => s.target);

function activeGaugeIndex(currentSection: SectionId | null): number {
  if (!currentSection) return 0;
  const direct = TARGETS.indexOf(currentSection);
  if (direct !== -1) return direct;
  const idx = SECTION_ORDER.indexOf(currentSection);
  if (idx <= 0) return 0;
  for (let i = idx; i >= 0; i--) {
    const t = TARGETS.indexOf(SECTION_ORDER[i]!);
    if (t !== -1) return t;
  }
  return 0;
}

export function AltitudeGauge(): ReactElement {
  const currentSection = useCurrentSection();
  const activeIndex = activeGaugeIndex(currentSection);

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
          aria-current={index === activeIndex ? 'step' : undefined}
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
