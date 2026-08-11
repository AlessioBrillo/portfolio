import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MosaicTile } from '@/components/ui/MosaicTile';
import { getMosaicEntries } from '@/content/mosaic';

interface MosaicProps {
  surface?: Surface;
}

/** 02 — The mosaic: the visual index of the puzzle. Each tile opens a case study. */
export function Mosaic({ surface = 'solid' }: MosaicProps): ReactElement {
  return (
    <Band id="mosaic" ariaLabel="The mosaic" tone="paper" surface={surface}>
      <SectionHeader eyebrow="02 — The Mosaic" title="Pieces under one roof" />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {getMosaicEntries().map((entry) => (
          <li key={entry.id}>
            <MosaicTile entry={entry} />
          </li>
        ))}
      </ul>
    </Band>
  );
}
