import type { SectionId } from '@/types/domain';
import { NIGHT_SECTIONS } from '@/lib/flight-profile';

/**
 * Whether a section rests on the night tone. Returns `false` for `null` so
 * callers can feed an unobserved section directly without a guard.
 *
 * The set of night sections is defined in flight-profile.ts as the single
 * source of truth (cruise band + night landing).
 */
export { NIGHT_SECTIONS };

export function isNightSection(section: SectionId | null): boolean {
  return section !== null && NIGHT_SECTIONS.has(section);
}

/** Legacy aliases for backward compatibility */
export const isNotteSection = isNightSection;
export const NOTTE_SECTIONS = NIGHT_SECTIONS;
