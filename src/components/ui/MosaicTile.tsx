import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MosaicEntry } from '@/types/domain';

interface MosaicTileProps {
  entry: MosaicEntry;
}

/**
 * Card surface shared by the linked and unlinked tile variants. An `<article>`
 * inside an `<a>` makes the link's accessible name compute to empty (Chrome),
 * so the anchor itself carries the card surface and its text stays inside it.
 */
const CARD_CLASSES =
  'flex h-full flex-col justify-between gap-6 rounded-[var(--radius-card)] border border-black/10 ' +
  'bg-cream/60 p-6 transition-[transform,border-color] duration-[var(--duration-normal)] ' +
  'ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-orange active:scale-[0.99] active:translate-y-[1px]';

const LINK_CLASSES = `${CARD_CLASSES} block h-full no-underline text-current`;

/**
 * A puzzle piece in the mosaic index. Hover lifts it and reveals an orange
 * edge. Route hrefs are SPA links into a case study; `#section` hrefs are
 * in-page anchors into the band that tells that story on the page.
 */
export function MosaicTile({ entry }: MosaicTileProps): ReactElement {
  const content = (
    <>
      <h3 className="font-display text-[length:var(--text-h3)] font-medium">{entry.title}</h3>
      <p className="text-sm leading-relaxed text-ink-soft">{entry.line}</p>
    </>
  );

  if (!entry.href) {
    return <article className={CARD_CLASSES}>{content}</article>;
  }

  return entry.href.startsWith('#') ? (
    <a href={entry.href} className={LINK_CLASSES}>
      {content}
    </a>
  ) : (
    <Link to={entry.href} className={LINK_CLASSES}>
      {content}
    </Link>
  );
}
