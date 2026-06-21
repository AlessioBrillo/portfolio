import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

/** 06 — Curated storytelling; "dig deeper" reveals the chronological archive. */
export function Experiences(): ReactElement {
  return (
    <Band id="experiences" ariaLabel="Experiences" tone="paper">
      <SectionHeader eyebrow="06 — Experiences" title="A curated record" />
    </Band>
  );
}
