import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface WorkSchoolProps {
  surface?: Surface;
}

/** 04 — Work & school projects. A light grid; each enlarges into detail. */
export function WorkSchool({ surface = 'solid' }: WorkSchoolProps): ReactElement {
  return (
    <Band id="work-school" ariaLabel="Work and school" tone="night" surface={surface}>
      <SectionHeader eyebrow="04 — Work & School" title="Things I have shipped" />
    </Band>
  );
}
