import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { EntryCard } from '@/components/ui/EntryCard';
import { getProjectEntries } from '@/content/projects';

interface WorkSchoolProps {
  surface?: Surface;
}

/** 04 — Work & school projects. A light grid; each enlarges into detail. */
export function WorkSchool({ surface = 'scene' }: WorkSchoolProps): ReactElement {
  const entries = getProjectEntries();

  return (
    <Band id="work-school" ariaLabel="Work and school" tone="notte" surface={surface}>
      <SectionHeader
        eyebrow="SECTOR 04 · OPERATIONAL LOG · 2 ENTRIES"
        title="Operational Log: Projects That Enlarge"
        intro="Built end to end, from the first commit to the deploy that proves it."
      />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2">
        {entries.map((entry) => (
          <li key={entry.id}>
            <EntryCard title={entry.title} line={entry.line} meta={entry.year} href={entry.href} />
          </li>
        ))}
      </ul>
    </Band>
  );
}
