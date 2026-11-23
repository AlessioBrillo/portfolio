import type { ImageAsset, WhoStatement } from '@/types/domain';

/**
 * The who band (01). Three adjectives made concrete, not listed — each line
 * shows the trait through something the author actually does.
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

/**
 * The portrait slot. No photograph is committed: synthetic test images were
 * removed because presenting them as a real portrait was misleading. Until an
 * author-owned photo is generated through `npm run images` (see
 * docs/content/photos.md), the asset carries only the honest label that
 * `ImageBlock` renders in place of an image.
 */
const PORTRAIT: ImageAsset = {
  alt: 'Portrait photo pending',
};

/** The three character statements, as an immutable snapshot. */
export function getWhoStatements(): readonly WhoStatement[] {
  return WHO_STATEMENTS.map((statement) => Object.freeze({ ...statement }));
}

/** The portrait slot: a labelled placeholder until a real photo lands. */
export function getWhoPortrait(): ImageAsset {
  return Object.freeze({ ...PORTRAIT });
}
