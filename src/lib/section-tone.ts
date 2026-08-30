import type { SectionId } from '@/types/domain';

/**
 * The sections resting on the notte tone — the single source of truth for
 * tone-aware chrome (top bar, altitude gauge), replacing the duplicated
 * `DARK_SECTIONS` sets. Per ADR-0010: the cruise band (ai-physics,
 * work-school) and the night landing (contact) are the only sections that
 * sit on notte; every other section rests on carta or inside a fade.
 */
export const NOTTE_SECTIONS: ReadonlySet<SectionId> = new Set([
  'ai-physics',
  'work-school',
  'contact',
]);

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
