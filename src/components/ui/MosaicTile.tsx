import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MosaicEntry } from '@/types/domain';
import { cn } from '@/lib/utils';

interface MosaicTileProps {
  entry: MosaicEntry;
}

/**
 * Brutalist puzzle cell: zero radius, visible structural border, ASCII corners,
 * macro title, micro description. Hover reveals accent edge.
 */
const CARD_BASE = cn(
  'relative flex h-full flex-col justify-between gap-4 p-6',
  'rounded-none',
  'border-[var(--hairline-thick)] border-ink/10 dark:border-phosphor/10',
  'bg-paper/80 dark:bg-night/80',
  'transition-[transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-sharp)]',
  'hover:-translate-y-2 hover:border-accent active:scale-[0.98] active:translate-y-[1px]',
  'ascii-corners',
);

const LINK_CLASSES = cn(CARD_BASE, 'block h-full no-underline text-current');

/**
 * A puzzle piece in the mosaic index. Hover lifts it and reveals an accent red
 * edge. Route hrefs are SPA links into a case study; `#section` hrefs are
 * in-page anchors into the band that tells that story on the page.
 */
export function MosaicTile({ entry }: MosaicTileProps): ReactElement {
  const content = (
    <>
      <h3 className="font-display text-[length:var(--text-h3)] font-black leading-[1.1] tracking-[-0.02em] text-balance">
        {entry.title}
      </h3>
      <p className="font-sans text-[length:var(--text-body-sm)] leading-[var(--leading-relaxed)] text-ink-soft dark:text-phosphor-dim">
        {entry.line}
      </p>
    </>
  );

  if (!entry.href) {
    return <article className={CARD_BASE}>{content}</article>;
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
