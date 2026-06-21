import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

/** 04 — Work & school projects. A light grid; each enlarges into detail. */
export function WorkSchool(): ReactElement {
  return (
    <Band id="work-school" ariaLabel="Work and school" tone="night">
      <SectionHeader eyebrow="04 — Work & School" title="Things I have shipped" />
    </Band>
  );
}
