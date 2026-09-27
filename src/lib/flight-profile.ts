import type { AltitudeBand, SectionId } from '@/types/domain';
import type { AltitudeStop } from '@/types/domain';
import type { BackdropToneName } from '@/lib/tone';

/**
 * Single Source of Truth for the entire flight profile.
 *
 * All structural, tonal, and navigational data derives from this definition.
 * See ADR-0010 (flight-profile-tonal-bands) and ADR-0006 (navigation-altitude-gauge).
 */
interface TonalTransition {
  readonly trigger: SectionId;
  readonly from: BackdropToneName;
  readonly to: BackdropToneName;
  readonly start: string;
  readonly end: string;
}

const TONAL_TRANSITIONS: readonly TonalTransition[] = [
  // Climb phase: ground → haze → night
  { trigger: 'who', from: 'paper', to: 'foschia', start: 'top bottom', end: 'top center' },
  { trigger: 'mosaic', from: 'foschia', to: 'night', start: 'top bottom', end: 'top center' },
  // Cruise holds night (no transition needed — ai-physics, work-school are on night)
  // Descent phase: night → dawn → paper
  { trigger: 'sky-sport', from: 'night', to: 'alba', start: 'top bottom', end: 'top center' },
  { trigger: 'experiences', from: 'alba', to: 'paper', start: 'top bottom', end: 'top center' },
  // Contact paints its own solid night outside TonalScene
] as const;

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
] as const;

/** Altitude gauge stops derived from flight sections. */
export const ALTITUDE_STOPS: readonly AltitudeStop[] = [
  { band: 'ground', label: 'GROUND', target: 'hero' },
  { band: 'climb', label: 'CLIMB', target: 'who' },
  { band: 'climb', label: 'MOSAIC', target: 'mosaic' },
  { band: 'cruise', label: 'CRUISE', target: 'ai-physics' },
  { band: 'cruise', label: 'OPS LOG', target: 'work-school' },
  { band: 'descent', label: 'DESCENT', target: 'sky-sport' },
  { band: 'descent', label: 'ARCHIVE', target: 'experiences' },
  { band: 'night', label: 'NIGHT', target: 'contact' },
] as const;

/** Tonal crossfade sequence — drives CSS Scroll-driven Animations and IntersectionObserver flip lines. */
export { TONAL_TRANSITIONS };

/** Sections that rest on the night tone — cruise band + night landing (contact). */
export const NIGHT_SECTIONS: ReadonlySet<SectionId> = new Set<SectionId>([
  'ai-physics',
  'work-school',
  'contact',
]);

/** Map from section ID to its altitude band — useful for tone-aware components. */
export const SECTION_BAND: ReadonlyMap<SectionId, AltitudeBand> = new Map<SectionId, AltitudeBand>([
  ['hero', 'ground'],
  ['who', 'climb'],
  ['mosaic', 'climb'],
  ['ai-physics', 'cruise'],
  ['work-school', 'cruise'],
  ['sky-sport', 'descent'],
  ['experiences', 'descent'],
  ['contact', 'night'],
]);

/** Map from section ID to its gauge label. */
export const SECTION_LABEL: ReadonlyMap<SectionId, string> = new Map<SectionId, string>([
  ['hero', 'GROUND'],
  ['who', 'CLIMB'],
  ['mosaic', 'MOSAIC'],
  ['ai-physics', 'CRUISE'],
  ['work-school', 'OPS LOG'],
  ['sky-sport', 'DESCENT'],
  ['experiences', 'ARCHIVE'],
  ['contact', 'NIGHT'],
]);

/** Map from section ID to its tonal transition trigger (self for most, but explicit for clarity). */
export const SECTION_TONAL_TRIGGER: ReadonlyMap<SectionId, SectionId> = new Map<
  SectionId,
  SectionId
>([
  ['hero', 'hero'],
  ['who', 'who'],
  ['mosaic', 'mosaic'],
  ['ai-physics', 'ai-physics'],
  ['work-school', 'work-school'],
  ['sky-sport', 'sky-sport'],
  ['experiences', 'experiences'],
  ['contact', 'contact'],
]);
