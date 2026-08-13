import type { ReactElement } from 'react';
import { ALTITUDE_STOPS, SECTION_ORDER } from '@/lib/altitude';
import { useSceneTone } from '@/components/ascent/tone-context';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAltitudeProfile } from '@/hooks/useAltitudeProfile';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { isNightSection } from '@/lib/section-tone';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/types/domain';

/**
 * The navigation IS the metaphor (ADR-0006): a vertical altitude gauge driven
 * by IntersectionObserver per `useCurrentSection`. Each altitude stop targets a
 * section element; the gauge lights the matching stop orange when that section
 * occupies the most viewport real estate. Sections without a dedicated stop
 * map to the nearest previous stop.
 *
 * Beside the labels, a vertical track fills with the flight's altitude
 * (rise-and-fall per ADR-0010, `useAltitudeProfile`): orange marks the current
 * position — the one place the accent indicates something functional.
 *
 * On mobile the gauge collapses into a thin top journey-progress bar
 * (`useScrollProgress`).
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
  const prefersReducedMotion = useReducedMotion();
  const altitude = useAltitudeProfile();
  const progress = useScrollProgress();
  const { tone: sceneTone } = useSceneTone();
  const activeIndex = activeGaugeIndex(currentSection);
  // Labels follow the live scene tone (ADR-0011) so they stay legible through
  // the blends; explicit solid-night sections still force dark chrome.
  const inDark = isNightSection(currentSection) || sceneTone === 'night';

  const goTo = (sectionId: string): void => {
    // CSS `scroll-behavior: auto` overrides only declarative scrolling, not
    // programmatic smooth scrolling — honour the preference explicitly (ADR-0009).
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <>
      <div
        aria-hidden
        data-testid="gauge-progress-bar"
        className="fixed inset-x-0 top-0 z-40 h-0.5 bg-ink/15 md:hidden"
      >
        <div
          data-testid="gauge-progress-fill"
          className="h-full bg-orange"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
      </div>
      <nav
        aria-label="Altitude navigation"
        className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-5 md:flex"
      >
        <div className="flex flex-col items-end gap-4">
          {ALTITUDE_STOPS.map((stop, index) => (
            <button
              key={stop.band}
              type="button"
              onClick={() => goTo(stop.target)}
              aria-current={index === activeIndex ? 'step' : undefined}
              className={cn(
                'font-mono text-[0.6875rem] uppercase tracking-[0.18em] transition-colors',
                index === activeIndex
                  ? 'text-orange'
                  : inDark
                    ? 'text-muted-dark hover:text-cream'
                    : 'text-ink-soft hover:text-ink',
              )}
            >
              {stop.label}
            </button>
          ))}
        </div>
        <div aria-hidden className="relative h-56 w-px overflow-hidden rounded-full bg-ink/15">
          <div
            data-testid="gauge-altitude-fill"
            className="absolute inset-x-0 bottom-0 bg-orange transition-[height] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]"
            style={{ height: `${Math.round(altitude * 100)}%` }}
          />
        </div>
      </nav>
    </>
  );
}
