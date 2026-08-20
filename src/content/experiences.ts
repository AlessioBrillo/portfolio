import type { ExperienceEntry } from '@/types/domain';

/**
 * The experiences band (06). Curated storytelling on the surface; the
 * "Dig deeper" link reaches the chronological archive route (ADR-0019).
 */
const EXPERIENCE_ENTRIES: readonly ExperienceEntry[] = [
  {
    id: 'the-ascent',
    title: 'Building The Ascent',
    line: 'The portfolio you are reading — engineering as part of the craft, committed in the open.',
    year: '2026',
  },
  {
    id: 'vds',
    title: 'Flying the VDS pattern',
    line: 'Ultralight flying with the VDS licence: discipline in the air, and the view that rewards it.',
  },
  {
    id: 'court-and-trail',
    title: 'Court and trail',
    line: 'Tennis and mountain biking — the two disciplines that keep the week honest.',
  },
];

/** The curated experience stories, as an immutable snapshot. */
export function getExperienceEntries(): readonly ExperienceEntry[] {
  return EXPERIENCE_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
