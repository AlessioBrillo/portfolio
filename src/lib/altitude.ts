import type { AltitudeStop, SectionId } from '@/types/domain';

/**
 * The ascent, top (ground) to summit (night). Order matches the on-page
 * section order so the altitude gauge and scroll position stay aligned.
 */
export const ALTITUDE_STOPS: readonly AltitudeStop[] = [
  { band: 'ground', label: 'GROUND', target: 'hero' },
  { band: 'haze', label: 'HAZE', target: 'mosaic' },
  { band: 'altitude', label: 'ALTITUDE', target: 'ai-physics' },
  { band: 'clear', label: 'CLEAR', target: 'sky-sport' },
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
