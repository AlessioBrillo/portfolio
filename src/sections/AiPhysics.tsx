import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EntryCard } from '@/components/ui/EntryCard';
import { getPublishedCaseStudies } from '@/content/case-studies/registry';

interface AiPhysicsProps {
  surface?: Surface;
}

/** 03 — The serious core for a recruiter. Rigorous, deep, case-study driven. */
export function AiPhysics({ surface = 'solid' }: AiPhysicsProps): ReactElement {
  const studies = getPublishedCaseStudies().filter((meta) => meta.domain === 'ai');

  return (
    <Band id="ai-physics" ariaLabel="AI and physics" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="SECTOR 03 · CORE TELEMETRY · 2 STUDIES"
        title="CORE TELEMETRY: WHERE THE THINKING SHOWS"
        intro="PROBLEM → APPROACH → RESULT. LONG-FORM CASE STUDIES OPEN AS THEIR OWN ROUTES."
      />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
        {studies.map((meta) => {
          const metaLine = [meta.role, meta.year].filter(Boolean).join(' · ');
          return (
            <li key={meta.slug}>
              <EntryCard
                title={meta.title}
                line={meta.summary}
                meta={metaLine}
                href={`/${meta.domain}/${meta.slug}`}
              />
            </li>
          );
        })}
      </ul>
    </Band>
  );
}
