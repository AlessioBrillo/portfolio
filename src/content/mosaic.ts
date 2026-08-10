import type { MosaicEntry } from '@/types/domain';

/**
 * The mosaic index (section 02). Content here is curated data, separate from
 * the presentation shell: ids are stable anchors for tests and analytics, and
 * every tile with an `href` must follow the /{domain}/{slug} case-study route
 * shape (asserted in mosaic.test.ts).
 */
const MOSAIC_ENTRIES: readonly MosaicEntry[] = [
  {
    id: 'ai-physics',
    title: 'AI & Physics',
    line: 'The serious core.',
    href: '/ai/transformer-italian-corpus',
  },
  { id: 'projects', title: 'Projects', line: 'Work and school, built end to end.' },
  { id: 'sky', title: 'Sky', line: 'Aviation and the VDS licence.' },
  { id: 'tennis', title: 'Tennis', line: 'Discipline on the court.' },
  { id: 'mtb', title: 'MTB', line: 'Lines down the mountain.' },
];

/** The curated mosaic entries, as an immutable snapshot. */
export function getMosaicEntries(): readonly MosaicEntry[] {
  return MOSAIC_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
