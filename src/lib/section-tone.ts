import type { SectionId } from '@/types/domain';
import { SECTION_ORDER } from '@/lib/altitude';
import { TONAL_TRANSITIONS } from '@/lib/tone';

/**
 * Computes the sections that rest on the `notte` tone from the single sources
 * of truth: `SECTION_ORDER` (structural page order) and `TONAL_TRANSITIONS`
 * (the flight's tonal crossfade sequence).
 *
 * Per ADR-0010: the cruise band (ai-physics, work-school) and the night
 * landing (contact) sit on notte. These are the sections between the climb's
 * final transition TO notte (mosaic: foschia → notte) and the descent's first
 * transition FROM notte (sky-sport: notte → alba), plus contact which paints
 * its own solid notte outside TonalScene.
 */
function computeNotteSections(): ReadonlySet<SectionId> {
  // Find the climb transition that lands on notte (mosaic: foschia → notte)
  const climbToNotte = TONAL_TRANSITIONS.find((t) => t.to === 'notte');
  // Find the descent transition that leaves notte (sky-sport: notte → alba)
  const descentFromNotte = TONAL_TRANSITIONS.find((t) => t.from === 'notte');

  if (!climbToNotte || !descentFromNotte) {
    // Fallback to explicit list if transitions change unexpectedly
    return new Set<SectionId>(['ai-physics', 'work-school', 'contact']);
  }

  const climbIndex = SECTION_ORDER.indexOf(climbToNotte.trigger);
  const descentIndex = SECTION_ORDER.indexOf(descentFromNotte.trigger);

  if (climbIndex === -1 || descentIndex === -1 || climbIndex >= descentIndex) {
    return new Set<SectionId>(['ai-physics', 'work-school', 'contact']);
  }

  // Sections between the climb landing and descent departure (exclusive of triggers)
  const cruiseSections = SECTION_ORDER.slice(climbIndex + 1, descentIndex);
  // Contact is always notte (solid surface outside TonalScene)
  return new Set<SectionId>([...cruiseSections, 'contact']);
}

/**
 * The sections resting on the notte tone — derived from SECTION_ORDER and
 * TONAL_TRANSITIONS so there is a single source of truth for the flight profile.
 * Per ADR-0010: the cruise band (ai-physics, work-school) and the night
 * landing (contact) are the only sections that sit on notte.
 */
export const NOTTE_SECTIONS: ReadonlySet<SectionId> = computeNotteSections();

/**
 * Whether a section rests on the notte tone. Returns `false` for `null` so
 * callers can feed an unobserved section directly without a guard.
 */
export function isNotteSection(section: SectionId | null): boolean {
  return section !== null && NOTTE_SECTIONS.has(section);
}

/** Legacy alias for backward compatibility */
export const isNightSection = isNotteSection;
export const NIGHT_SECTIONS = NOTTE_SECTIONS;
