import type { ProjectEntry } from '@/types/domain';

/**
 * The work & school band (04). Curated data, separate from the presentation
 * shell; ids are stable anchors for tests and analytics. Entries with an
 * `href` must follow the /{domain}/{slug} case-study route shape (asserted in
 * projects.test.ts).
 */
const PROJECT_ENTRIES: readonly ProjectEntry[] = [
  {
    id: 'the-ascent',
    title: 'The Ascent',
    line: 'This portfolio — a scroll-driven tonal flight in React 19, TypeScript and GSAP.',
    year: '2026',
    href: '/work/the-ascent',
  },
  {
    id: 'transformer-italian-corpus',
    title: 'A transformer on Italian',
    line: 'A small transformer trained from scratch on an Italian-language corpus.',
    year: '2025',
    href: '/ai/transformer-italian-corpus',
  },
];

/** The curated project entries, as an immutable snapshot. */
export function getProjectEntries(): readonly ProjectEntry[] {
  return PROJECT_ENTRIES.map((entry) => Object.freeze({ ...entry }));
}
