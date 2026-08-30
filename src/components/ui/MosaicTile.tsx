import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MosaicEntry } from '@/types/domain';
import { cn } from '@/lib/utils';
import { useSceneTone } from '@/components/ascent/tone-context';

interface MosaicTileProps {
  entry: MosaicEntry;
}

/**
 * Puzzle cell: zero radius, visible structural border, ASCII corners,
 * macro title, micro description. Hover reveals accent edge.
 * Uses design tokens via sceneTone context.
 */
export function MosaicTile({ entry }: MosaicTileProps): ReactElement {
  const sceneTone = useSceneTone();
  const isNotte = sceneTone.tone === 'notte';

  const cardBase = cn(
    'relative flex h-full flex-col justify-between gap-4 p-6',
    'rounded-none',
    'border-[var(--hairline-thick)]',
    isNotte ? 'border-hairline-dark' : 'border-hairline-light',
    isNotte ? 'bg-notte/80' : 'bg-carta/80',
    'transition-[transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-sharp)]',
    'hover:-translate-y-2 hover:border-accent active:scale-[0.98] active:translate-y-[1px]',
    'ascii-corners',
  );

  const linkClasses = cn(cardBase, 'block h-full no-underline text-current');

  const content = (
    <>
      <h3 className="font-display text-[length:var(--text-h3)] font-medium leading-[var(--leading-snug)] tracking-[var(--tracking-tight-sm)] text-balance">
        {entry.title}
      </h3>
      <p
        className={cn(
          'font-sans text-[length:var(--text-body-sm)] leading-[var(--leading-relaxed)]',
          isNotte ? 'text-panna-dim' : 'text-ink-soft',
        )}
      >
        {entry.line}
      </p>
    </>
  );

  if (!entry.href) {
    return <article className={cardBase}>{content}</article>;
  }

  return entry.href.startsWith('#') ? (
    <a href={entry.href} className={linkClasses}>
      {content}
    </a>
  ) : (
    <Link to={entry.href} className={linkClasses}>
      {content}
    </Link>
  );
}
