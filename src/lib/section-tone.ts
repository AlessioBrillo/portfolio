import type { SectionId } from '@/types/domain';
import { SECTION_ORDER } from '@/lib/altitude';
import { TONAL_TRANSITIONS } from '@/lib/tone';

/**
 * Computes the sections that rest on the `night` tone from the single sources
 * of truth: `SECTION_ORDER` (structural page order) and `TONAL_TRANSITIONS`
 * (the flight's tonal crossfade sequence).
 *
 * Per ADR-0010: the cruise band (ai-physics, work-school) and the night
 * landing (contact) sit on night. These are the sections between the climb's
 * final transition TO night (mosaic: foschia → night) and the descent's first
 * transition FROM night (sky-sport: night → alba), plus contact which paints
 * its own solid night outside TonalScene.
 */
function computeNightSections(): ReadonlySet<SectionId> {
  // Find the climb transition that lands on night (mosaic: foschia → night)
  const climbToNight = TONAL_TRANSITIONS.find((t) => t.to === 'night');
  // Find the descent transition that leaves night (sky-sport: night → alba)
  const descentFromNight = TONAL_TRANSITIONS.find((t) => t.from === 'night');

  if (!climbToNight || !descentFromNight) {
    // Fallback to explicit list if transitions change unexpectedly
    return new Set<SectionId>(['ai-physics', 'work-school', 'contact']);
  }

  const climbIndex = SECTION_ORDER.indexOf(climbToNight.trigger);
  const descentIndex = SECTION_ORDER.indexOf(descentFromNight.trigger);

  if (climbIndex === -1 || descentIndex === -1 || climbIndex >= descentIndex) {
    return new Set<SectionId>(['ai-physics', 'work-school', 'contact']);
  }

  // Sections between the climb landing and descent departure (exclusive of triggers)
  const cruiseSections = SECTION_ORDER.slice(climbIndex + 1, descentIndex);
  // Contact is always night (solid surface outside TonalScene)
  return new Set<SectionId>([...cruiseSections, 'contact']);
}

/**
 * The sections resting on the night tone — derived from SECTION_ORDER and
 * TONAL_TRANSITIONS so there is a single source of truth for the flight profile.
 * Per ADR-0010: the cruise band (ai-physics, work-school) and the night
 * landing (contact) are the only sections that sit on night.
 */
export const NIGHT_SECTIONS: ReadonlySet<SectionId> = computeNightSections();

/**
 * Whether a section rests on the night tone. Returns `false` for `null` so
 * callers can feed an unobserved section directly without a guard.
 */
export function isNightSection(section: SectionId | null): boolean {
  return section !== null && NIGHT_SECTIONS.has(section);
}

/** Legacy aliases for backward compatibility */
export const isNotteSection = isNightSection;
export const NOTTE_SECTIONS = NIGHT_SECTIONS;
