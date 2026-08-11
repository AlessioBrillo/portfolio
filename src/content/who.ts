import type { WhoStatement } from '@/types/domain';

/**
 * The who band (01). Three adjectives made concrete, not listed — each line
 * shows the trait through something the author actually does. The sober
 * portrait is a photo slot awaiting a real photo (roadmap Phase 0/5).
 */
const WHO_STATEMENTS: readonly WhoStatement[] = [
  {
    id: 'enterprising',
    title: 'Enterprising',
    line: 'I ship end to end: a transformer trained from scratch, this site authored and deployed — each piece closed before the next opens.',
  },
  {
    id: 'adventurous',
    title: 'Adventurous',
    line: 'I fly ultralight aircraft on a VDS licence — altitude is a habit, and the sky is the narrative thread of this site.',
  },
  {
    id: 'curious',
    title: 'Curious',
    line: 'AI and physics, studied seriously and built hands-on: tokenizers, training runs, and the questions that survive them.',
  },
];

const PORTRAIT = {
  alt: 'A sober portrait of Alessio Brillo',
} as const;

/** The three character statements, as an immutable snapshot. */
export function getWhoStatements(): readonly WhoStatement[] {
  return WHO_STATEMENTS.map((statement) => Object.freeze({ ...statement }));
}

/** The portrait slot: alt text is written for the intended photo (ADR-0009). */
export function getWhoPortrait(): Readonly<{ alt: string }> {
  return PORTRAIT;
}
