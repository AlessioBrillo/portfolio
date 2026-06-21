import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { MosaicEntry } from '@/types/domain';
import { cn } from '@/lib/utils';

interface MosaicTileProps {
  entry: MosaicEntry;
}

/** A puzzle piece in the mosaic index. Hover lifts it and reveals an orange edge. */
export function MosaicTile({ entry }: MosaicTileProps): ReactElement {
  const tile = (
    <article
      className={cn(
        'flex h-full flex-col justify-between gap-6 rounded-[var(--radius-card)] border border-black/10',
        'bg-cream/60 p-6 transition-[transform,border-color] duration-[var(--duration-normal)]',
        'ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-orange',
      )}
    >
      <h3 className="font-display text-[length:var(--text-h3)] font-medium">{entry.title}</h3>
      <p className="text-sm leading-relaxed text-muted-light">{entry.line}</p>
    </article>
  );

  return entry.href ? (
    <Link to={entry.href} className="block h-full no-underline text-current">
      {tile}
    </Link>
  ) : (
    tile
  );
}
