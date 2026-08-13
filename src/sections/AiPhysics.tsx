import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EntryCard } from '@/components/ui/EntryCard';
import { CASE_STUDIES } from '@/content/case-studies/registry';

interface AiPhysicsProps {
  surface?: Surface;
}

/** 03 — The serious core for a recruiter. Rigorous, deep, case-study driven. */
export function AiPhysics({ surface = 'solid' }: AiPhysicsProps): ReactElement {
  const studies = Object.values(CASE_STUDIES).filter((entry) => entry.meta.domain === 'ai');

  return (
    <Band id="ai-physics" ariaLabel="AI and physics" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="03 — AI & Physics"
        title="Where the thinking shows"
        intro="Problem -> approach -> result. Long-form case studies open as their own routes."
      />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
        {studies.map((entry) => {
          const meta = entry.meta;
          const metaLine = [meta.role, meta.year].filter(Boolean).join(' \u00B7 ');
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
