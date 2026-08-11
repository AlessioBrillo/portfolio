import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { getExperienceEntries } from '@/content/experiences';

interface ExperiencesProps {
  surface?: Surface;
}

/** 06 — Curated storytelling; "dig deeper" reveals the chronological archive. */
export function Experiences({ surface = 'solid' }: ExperiencesProps): ReactElement {
  return (
    <Band id="experiences" ariaLabel="Experiences" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="06 — Experiences"
        title="A curated record"
        intro="What I choose to show, told short — the archive can come later."
      />
      <ol className="mt-12 flex list-none flex-col divide-y divide-black/10 p-0">
        {getExperienceEntries().map((entry) => (
          <li key={entry.id} className="flex flex-col gap-1 py-6 sm:flex-row sm:gap-6">
            {entry.year ? (
              <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-ink-soft sm:w-24 sm:pt-2">
                {entry.year}
              </span>
            ) : null}
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-[length:var(--text-h3)] font-medium">
                {entry.title}
              </h3>
              <p className="leading-relaxed text-ink-soft">{entry.line}</p>
            </div>
          </li>
        ))}
      </ol>
    </Band>
  );
}
