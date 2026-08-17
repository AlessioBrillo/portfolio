import type { AltitudeStop, SectionId } from '@/types/domain';

/**
 * The flight profile, top (ground) to landing (night). Order matches the on-page
 * section order so the altitude gauge and scroll position stay aligned. The
 * profile rises and falls — cruise sits above the cloud deck (dark sky), descent
 * breaks back into daylight before the night landing. See ADR-0010.
 */
export const ALTITUDE_STOPS: readonly AltitudeStop[] = [
  { band: 'ground', label: 'GROUND', target: 'hero' },
  { band: 'climb', label: 'CLIMB', target: 'mosaic' },
  { band: 'cruise', label: 'CRUISE', target: 'ai-physics' },
  { band: 'descent', label: 'DESCENT', target: 'sky-sport' },
  { band: 'night', label: 'NIGHT', target: 'contact' },
];

/** Section order, top to bottom — the structural backbone of the page. */
export const SECTION_ORDER: readonly SectionId[] = [
  'hero',
  'who',
  'mosaic',
  'ai-physics',
  'work-school',
  'sky-sport',
  'experiences',
  'contact',
];

/**
 * The gauge's rise-and-fall fill (ADR-0006, ADR-0010): the flight's altitude
 * as a pure function of page scroll progress. Ground and landing sit at 0,
 * cruise at the peak (1); climb and descent are linear ramps between the
 * anchors, whose scroll-progress fractions are measured from the live page
 * (`useAltitudeProfile`). Kept DOM-free so the profile is unit-testable and
 * the gauge cannot drift from the page structure.
 */
export interface FlightAnchors {
  /** Scroll progress at which the flight is on the ground (hero). */
  readonly ground: number;
  /** Scroll progress of the cruise peak (ai-physics). */
  readonly cruise: number;
  /** Scroll progress of the night landing (contact). */
  readonly night: number;
}

export function flightPositionAt(progress: number, anchors: FlightAnchors): number {
  const { ground, cruise, night } = anchors;
  if (progress <= ground || progress >= night) return 0;
  // The clamp above guarantees ground < progress < night. While progress is
  // at or below cruise the climb ramp is valid; beyond it the descent ramp is
  // valid. Out-of-order anchors (e.g. cruise below ground) can only produce
  // flat or mirrored ramps, never a division by a non-positive distance.
  if (progress <= cruise) return (progress - ground) / (cruise - ground);
  return 1 - (progress - cruise) / (night - cruise);
}

/**
 * Maps the section currently observed by `useCurrentSection` to the altitude
 * stop the gauge should light: the direct stop when the section is one, else
 * the nearest previous stop walking backward through the section order. Pure
 * over injected arrays so the degenerate cases are unit-testable; the gauge
 * supplies its own targets/order.
 */
export function resolveGaugeStop(
  currentSection: SectionId | null,
  targets: readonly SectionId[],
  order: readonly SectionId[],
): number {
  if (!currentSection) return 0;
  const direct = targets.indexOf(currentSection);
  if (direct !== -1) return direct;
  const idx = order.indexOf(currentSection);
  if (idx <= 0) return 0;
  for (let i = idx; i >= 0; i--) {
    const t = targets.indexOf(order[i]!);
    if (t !== -1) return t;
  }
  return 0;
}
