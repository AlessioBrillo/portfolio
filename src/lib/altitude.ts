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
