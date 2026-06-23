import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface AiPhysicsProps {
  surface?: Surface;
}

/** 03 — The serious core for a recruiter. Rigorous, deep, case-study driven. */
export function AiPhysics({ surface = 'solid' }: AiPhysicsProps): ReactElement {
  return (
    <Band id="ai-physics" ariaLabel="AI and physics" tone="night" surface={surface}>
      <SectionHeader
        eyebrow="03 — AI & Physics"
        title="Where the thinking shows"
        intro="Problem -> approach -> result. Long-form case studies open as their own routes."
      />
    </Band>
  );
}
