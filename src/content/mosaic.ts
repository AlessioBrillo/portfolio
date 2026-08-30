import type { MosaicEntry } from '@/types/domain';

/**
 * The mosaic index (section 02). Content here is curated data, separate from
 * the presentation shell: ids are stable anchors for tests and analytics.
 * Every tile links somewhere real — a `/{domain}/{slug}` case-study route
 * (asserted in mosaic.test.ts) when the study is published, or a `#section`
 * anchor to the band that tells that story on the page (anchors are validated
 * against the live `SECTION_ORDER` in mosaic.test.ts).
 */
const MOSAIC_ENTRIES: readonly MosaicEntry[] = [
  {
    id: 'ai-physics',
    title: 'AI & Physics',
    line: 'The serious core.',
    href: '/ai/transformer-italian-corpus',
  },
  {
    id: 'projects',
    title: 'Projects',
    line: 'Work and school, built end to end.',
    href: '/work/the-ascent',
  },
  {
    id: 'sky',
    title: 'Sky',
    line: 'Aviation and the VDS licence.',
    href: '/sky/vds-licence',
  },
  { id: 'tennis', title: 'Tennis', line: 'Discipline on the court.', href: '#sky-sport' },
  { id: 'mtb', title: 'MTB', line: 'Lines down the mountain.', href: '#sky-sport' },
];

/** The curated mosaic entries, as an immutable snapshot. */
export function getMosaicEntries(): readonly MosaicEntry[] {
  return MOSAIC_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
