import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface WhoProps {
  surface?: Surface;
}

/** 01 — Character. Three adjectives made concrete, not listed. */
export function Who({ surface = 'solid' }: WhoProps): ReactElement {
  return (
    <Band id="who" ariaLabel="Who I am" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="01 — Who"
        title="Enterprising, adventurous, curious"
        intro="Three short statements that show, rather than claim. Placeholder copy lives in docs/content/sections.md."
      />
    </Band>
  );
}
