import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

/** 01 — Character. Three adjectives made concrete, not listed. */
export function Who(): ReactElement {
  return (
    <Band id="who" ariaLabel="Who I am" tone="paper">
      <SectionHeader
        eyebrow="01 — Who"
        title="Enterprising, adventurous, curious"
        intro="Three short statements that show, rather than claim. Placeholder copy lives in docs/content/sections.md."
      />
    </Band>
  );
}
