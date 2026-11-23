import type { SportEntry } from '@/types/domain';

/**
 * The sky & sport band (05). Curated data, separate from the presentation
 * shell; ids are stable anchors for tests and analytics. The image slots are
 * deliberately empty: synthetic test images were removed because captions
 * describing them as real flights and courts were misleading. Each slot gets
 * a real, author-owned asset through `npm run images` (docs/content/photos.md).
 */
const SPORT_ENTRIES: readonly SportEntry[] = [
  {
    id: 'vds',
    title: 'The VDS licence',
    line: 'Ultralight flying — the narrative thread of the whole site.',
    image: { alt: 'Photo pending: ultralight aircraft on the ramp' },
  },
  {
    id: 'tennis',
    title: 'Tennis',
    line: 'Discipline on the court.',
    image: { alt: 'Photo pending: tennis court at evening practice' },
  },
  {
    id: 'mtb',
    title: 'MTB',
    line: 'Lines down the mountain.',
    image: { alt: 'Photo pending: mountain bike trail downhill' },
  },
];

/** The curated sport entries, as an immutable snapshot. */
export function getSportEntries(): readonly SportEntry[] {
  return SPORT_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
