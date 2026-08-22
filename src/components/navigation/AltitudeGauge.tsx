import type { ReactElement } from 'react';
import { ALTITUDE_STOPS, resolveGaugeStop, SECTION_ORDER } from '@/lib/altitude';
import { useSceneTone } from '@/components/ascent/tone-context';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAltitudeProfile } from '@/hooks/useAltitudeProfile';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { isNightSection } from '@/lib/section-tone';
import { cn } from '@/lib/utils';
import type { SectionId } from '@/types/domain';

/**
 * Brutalist flight instrument: vertical gauge with structural track, mono labels,
 * accent position marker. Mobile: top progress bar with visible grid ticks.
 */
const TARGETS: readonly SectionId[] = ALTITUDE_STOPS.map((s) => s.target);

export function AltitudeGauge(): ReactElement {
  const currentSection = useCurrentSection();
  const prefersReducedMotion = useReducedMotion();
  const altitude = useAltitudeProfile();
  const progress = useScrollProgress();
  const { tone: sceneTone } = useSceneTone();
  const activeIndex = resolveGaugeStop(currentSection, TARGETS, SECTION_ORDER);
  const inDark = isNightSection(currentSection) || sceneTone === 'night';
  const trackColor = inDark ? 'bg-phosphor/10' : 'bg-ink/10';
  const labelColor = inDark ? 'text-phosphor-dim' : 'text-ink-soft';
  const labelHover = inDark ? 'hover:text-phosphor' : 'hover:text-ink';
  const activeColor = 'text-accent';

  const goTo = (sectionId: string): void => {
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
        className="fixed inset-x-0 top-0 z-40 h-1 border-b border-ink/10 dark:border-phosphor/10 md:hidden"
      >
        <div
          data-testid="gauge-progress-fill"
          className="h-full bg-accent"
          style={{ width: `${Math.round(progress * 100)}%` }}
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-full h-[4px] grid-blueprint"
          style={{ gridTemplateColumns: 'repeat(var(--grid-columns), 1fr)' }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border-ink/10 dark:border-phosphor/10" />
          ))}
        </div>
      </div>
      <nav
        aria-label="Altitude navigation"
        className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-5 md:flex"
      >
        <div className="relative">
          <div
            aria-hidden
            className={cn('absolute left-1/2 -translate-x-1/2 h-full w-px', trackColor)}
          />
          <div className="flex flex-col items-end gap-6">
            {ALTITUDE_STOPS.map((stop, index) => (
              <button
                key={stop.band}
                type="button"
                onClick={() => goTo(stop.target)}
                aria-current={index === activeIndex ? 'step' : undefined}
                className={cn(
                  'relative font-mono text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-widest)] transition-colors active:scale-[0.97] pr-4',
                  index === activeIndex ? activeColor : cn(labelColor, labelHover),
                )}
              >
                {stop.label}
                {index === activeIndex && (
                  <span
                    aria-hidden
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-accent rounded-none"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className={cn(
            'relative h-56 w-px overflow-hidden border-l-[var(--hairline-thick)]',
            trackColor,
          )}
        >
          <div
            data-testid="gauge-altitude-fill"
            className="absolute inset-x-0 bottom-0 bg-accent transition-[height] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]"
            style={{ height: `${Math.round(altitude * 100)}%` }}
          />
        </div>
      </nav>
    </>
  );
}
