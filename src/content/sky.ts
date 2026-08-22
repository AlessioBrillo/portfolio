import type { SportEntry } from '@/types/domain';

/**
 * The sky & sport band (05). Curated data, separate from the presentation
 * shell; ids are stable anchors for tests and analytics. Photo slots carry
 * alt text written for the intended photo (ADR-0009): real content for real
 * images, generated from `npm run images -- --src temp-raw-photos`.
 */
const SPORT_ENTRIES: readonly SportEntry[] = [
  {
    id: 'vds',
    title: 'The VDS licence',
    line: 'Ultralight flying — the narrative thread of the whole site.',
    image: {
      alt: 'An ultralight aircraft on the ramp before a flight',
      caption: 'VDS · northern Italy',
      src: '/photos/vds-aircraft-ramp-960-5d1bfcde.jpg',
      width: 960,
      height: 720,
      sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
      sources: [
        {
          type: 'image/avif',
          srcSet:
            '/photos/vds-aircraft-ramp-480-5d1bfcde.avif 480w, /photos/vds-aircraft-ramp-960-5d1bfcde.avif 960w',
        },
        {
          type: 'image/webp',
          srcSet:
            '/photos/vds-aircraft-ramp-480-5d1bfcde.webp 480w, /photos/vds-aircraft-ramp-960-5d1bfcde.webp 960w',
        },
      ],
    },
  },
  {
    id: 'tennis',
    title: 'Tennis',
    line: 'Discipline on the court.',
    image: {
      alt: 'A tennis court at evening practice',
      src: '/photos/tennis-court-evening-960-4b43e602.jpg',
      width: 960,
      height: 720,
      sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
      sources: [
        {
          type: 'image/avif',
          srcSet:
            '/photos/tennis-court-evening-480-4b43e602.avif 480w, /photos/tennis-court-evening-960-4b43e602.avif 960w',
        },
        {
          type: 'image/webp',
          srcSet:
            '/photos/tennis-court-evening-480-4b43e602.webp 480w, /photos/tennis-court-evening-960-4b43e602.webp 960w',
        },
      ],
    },
  },
  {
    id: 'mtb',
    title: 'MTB',
    line: 'Lines down the mountain.',
    image: {
      alt: 'A mountain bike trail winding downhill',
      src: '/photos/mtb-trail-downhill-960-16c6963b.jpg',
      width: 960,
      height: 720,
      sizes: '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw',
      sources: [
        {
          type: 'image/avif',
          srcSet:
            '/photos/mtb-trail-downhill-480-16c6963b.avif 480w, /photos/mtb-trail-downhill-960-16c6963b.avif 960w',
        },
        {
          type: 'image/webp',
          srcSet:
            '/photos/mtb-trail-downhill-480-16c6963b.webp 480w, /photos/mtb-trail-downhill-960-16c6963b.webp 960w',
        },
      ],
    },
  },
];

/** The curated sport entries, as an immutable snapshot. */
export function getSportEntries(): readonly SportEntry[] {
  return SPORT_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
