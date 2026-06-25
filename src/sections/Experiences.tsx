import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface ExperiencesProps {
  surface?: Surface;
}

/** 06 — Curated storytelling; "dig deeper" reveals the chronological archive. */
export function Experiences({ surface = 'solid' }: ExperiencesProps): ReactElement {
  return (
    <Band id="experiences" ariaLabel="Experiences" tone="paper" surface={surface}>
      <SectionHeader eyebrow="06 — Experiences" title="A curated record" />
    </Band>
  );
}
