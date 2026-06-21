import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

/** 03 — The serious core for a recruiter. Rigorous, deep, case-study driven. */
export function AiPhysics(): ReactElement {
  return (
    <Band id="ai-physics" ariaLabel="AI and physics" tone="night">
      <SectionHeader
        eyebrow="03 — AI & Physics"
        title="Where the thinking shows"
        intro="Problem -> approach -> result. Long-form case studies open as their own routes."
      />
    </Band>
  );
}
