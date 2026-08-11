import type { SectionId } from '@/types/domain';

/**
 * The sections resting on the night tone — the single source of truth for
 * tone-aware chrome (top bar, altitude gauge), replacing the duplicated
 * `DARK_SECTIONS` sets. Per ADR-0010: the cruise band (ai-physics,
 * work-school) and the night landing (contact) are the only sections that
 * sit on night; every other section rests on paper or inside a fade.
 */
export const NIGHT_SECTIONS: ReadonlySet<SectionId> = new Set([
  'ai-physics',
  'work-school',
  'contact',
]);

/**
 * Whether a section rests on the night tone. Returns `false` for `null` so
 * callers can feed an unobserved section directly without a guard.
 */
export function isNightSection(section: SectionId | null): boolean {
  return section !== null && NIGHT_SECTIONS.has(section);
}
