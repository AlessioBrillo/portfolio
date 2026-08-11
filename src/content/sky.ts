import type { SportEntry } from '@/types/domain';

/**
 * The sky & sport band (05). Curated data, separate from the presentation
 * shell; ids are stable anchors for tests and analytics. Photo slots carry
 * alt text written for the intended photo (ADR-0009): real content for real
 * images, none of the images shipped yet.
 */
const SPORT_ENTRIES: readonly SportEntry[] = [
  {
    id: 'vds',
    title: 'The VDS licence',
    line: 'Ultralight flying — the narrative thread of the whole site.',
    image: {
      alt: 'An ultralight aircraft on the ramp before a flight',
      caption: 'VDS · northern Italy',
    },
  },
  {
    id: 'tennis',
    title: 'Tennis',
    line: 'Discipline on the court.',
    image: {
      alt: 'A tennis court at evening practice',
    },
  },
  {
    id: 'mtb',
    title: 'MTB',
    line: 'Lines down the mountain.',
    image: {
      alt: 'A mountain bike trail winding downhill',
    },
  },
];

/** The curated sport entries, as an immutable snapshot. */
export function getSportEntries(): readonly SportEntry[] {
  return SPORT_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
