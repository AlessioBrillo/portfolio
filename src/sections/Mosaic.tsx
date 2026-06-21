import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { MosaicTile } from '@/components/ui/MosaicTile';
import type { MosaicEntry } from '@/types/domain';

const ENTRIES: readonly MosaicEntry[] = [
  {
    id: 'ai-physics',
    title: 'AI & Physics',
    line: 'The serious core.',
    href: '/ai/transformer-italian-corpus',
  },
  { id: 'projects', title: 'Projects', line: 'Work and school, built end to end.' },
  { id: 'sky', title: 'Sky', line: 'Aviation and the VDS licence.' },
  { id: 'tennis', title: 'Tennis', line: 'Discipline on the court.' },
  { id: 'mtb', title: 'MTB', line: 'Lines down the mountain.' },
];

/** 02 — The mosaic: the visual index of the puzzle. Each tile opens a case study. */
export function Mosaic(): ReactElement {
  return (
    <Band id="mosaic" ariaLabel="The mosaic" tone="paper">
      <SectionHeader eyebrow="02 — The Mosaic" title="Pieces under one roof" />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {ENTRIES.map((entry) => (
          <li key={entry.id}>
            <MosaicTile entry={entry} />
          </li>
        ))}
      </ul>
    </Band>
  );
}
