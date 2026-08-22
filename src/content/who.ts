import type { ImageAsset, WhoStatement } from '@/types/domain';

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

/**
 * The portrait slot: a full responsive asset (ADR-0009). Generated from
 * `npm run images -- --src temp-raw-photos` (synthetic test image).
 * Intrinsic 4:5 ratio with `sizes` reserves layout (zero CLS).
 */
const PORTRAIT: ImageAsset = {
  alt: 'A sober portrait of Alessio Brillo',
  src: '/photos/portrait-4x5-960-b4df065a.jpg',
  width: 960,
  height: 1200,
  sizes: '(min-width: 1024px) 40vw, 100vw',
  sources: [
    {
      type: 'image/avif',
      srcSet:
        '/photos/portrait-4x5-480-b4df065a.avif 480w, /photos/portrait-4x5-960-b4df065a.avif 960w',
    },
    {
      type: 'image/webp',
      srcSet:
        '/photos/portrait-4x5-480-b4df065a.webp 480w, /photos/portrait-4x5-960-b4df065a.webp 960w',
    },
  ],
} as const;

/** The three character statements, as an immutable snapshot. */
export function getWhoStatements(): readonly WhoStatement[] {
  return WHO_STATEMENTS.map((statement) => Object.freeze({ ...statement }));
}

/** The portrait slot: a photo-ready asset with real derivatives. */
export function getWhoPortrait(): ImageAsset {
  return Object.freeze({ ...PORTRAIT });
}
