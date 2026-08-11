import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { SCENE_SOFT_TEXT, useSceneTone } from '@/components/ascent/tone-context';
import { getWhoPortrait, getWhoStatements } from '@/content/who';

interface WhoProps {
  surface?: Surface;
}

/** 01 — Character. Three adjectives made concrete, not listed. */
export function Who({ surface = 'solid' }: WhoProps): ReactElement {
  const { tone } = useSceneTone();
  return (
    <Band id="who" ariaLabel="Who I am" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="01 — Who"
        title="Enterprising, adventurous, curious"
        intro="Three statements that show, rather than claim."
      />
      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <ImageBlock alt={getWhoPortrait().alt} className="lg:sticky lg:top-24" />
        <ul className="flex list-none flex-col gap-8 p-0">
          {getWhoStatements().map((statement) => (
            <li key={statement.id} className="flex flex-col gap-2 border-t border-black/10 pt-4">
              <h3 className="font-display text-[length:var(--text-h3)] font-medium">
                {statement.title}
              </h3>
              <p className={`max-w-prose leading-relaxed ${SCENE_SOFT_TEXT[tone]}`}>
                {statement.line}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Band>
  );
}
