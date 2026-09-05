import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ImageBlock } from '@/components/ui/ImageBlock';
import { SCENE_SOFT_TEXT, useSceneTone } from '@/components/ascent/tone-context';
import { getSportEntries } from '@/content/sky';

interface SkySportProps {
  surface?: Surface;
}

/** 05 — The adventurous side: aviation/VDS, tennis, MTB. Very visual. */
export function SkySport({ surface = 'scene' }: SkySportProps): ReactElement {
  const { softTone } = useSceneTone();
  return (
    <Band id="sky-sport" ariaLabel="Sky and sport" tone="night" surface={surface}>
      <SectionHeader
        eyebrow="SECTOR 05 · DESCENT VECTOR · 3 DISCIPLINES"
        title="Descent Vector: Aviation · Tennis · Mountain"
        intro="Aviation is also the narrative thread of the whole site — the circle closes here."
      />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {getSportEntries().map((entry) => (
          <li key={entry.id}>
            <article className="flex h-full flex-col gap-4">
              <ImageBlock {...entry.image} />
              <h3 className="font-display text-[length:var(--text-h3)] font-medium leading-[var(--leading-snug)] tracking-[var(--tracking-tight-sm)] text-balance">
                {entry.title}
              </h3>
              <p
                className={`font-sans text-[length:var(--text-body-sm)] leading-[var(--leading-relaxed)] ${SCENE_SOFT_TEXT[softTone]}`}
              >
                {entry.line}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </Band>
  );
}
