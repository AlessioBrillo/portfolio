import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MosaicTile } from '@/components/ui/MosaicTile';
import { getMosaicEntries } from '@/content/mosaic';
import { cn } from '@/lib/utils';

interface MosaicProps {
  surface?: Surface;
}

/** 02 — The mosaic: the visual index of the puzzle. Each tile opens a case study. */
export function Mosaic({ surface = 'scene' }: MosaicProps): ReactElement {
  const entries = getMosaicEntries();

  return (
    <Band id="mosaic" ariaLabel="The mosaic" tone="carta" surface={surface}>
      <SectionHeader
        eyebrow="SECTOR 02 · MOSAIC INDEX · 6 PIECES"
        title="Puzzle Index: Pieces Under One Roof"
      />
      <ul className="mt-12 grid list-none p-0 gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:grid-rows-[auto_auto_auto_auto_auto_auto]">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className={cn(
              'min-h-[280px]',
              index === 0 && 'lg:row-span-2 lg:col-start-1',
              index === 1 && 'lg:row-start-1 lg:col-start-2',
              index === 2 && 'lg:row-start-2 lg:col-start-2',
              index === 3 && 'lg:row-span-2 lg:row-start-3 lg:col-start-1',
              index === 4 && 'lg:row-start-4 lg:col-start-2',
              index === 5 && 'lg:row-start-5 lg:col-start-1 lg:col-span-2',
            )}
          >
            <MosaicTile entry={entry} />
          </li>
        ))}
      </ul>
    </Band>
  );
}
