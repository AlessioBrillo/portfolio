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
export function SkySport({ surface = 'solid' }: SkySportProps): ReactElement {
  const { softTone } = useSceneTone();
  return (
    <Band id="sky-sport" ariaLabel="Sky and sport" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="SECTOR 05 · DESCENT VECTOR · 3 DISCIPLINES"
        title="DESCENT VECTOR: AVIATION · TENNIS · MOUNTAIN"
        intro="AVIATION IS ALSO THE NARRATIVE THREAD OF THE WHOLE SITE — THE CIRCLE CLOSES HERE."
      />
      <ul className="mt-12 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {getSportEntries().map((entry) => (
          <li key={entry.id}>
            <article className="flex h-full flex-col gap-4">
              <ImageBlock {...entry.image} />
              <h3 className="font-display text-[length:var(--text-h3)] font-black leading-[1.1] tracking-[-0.02em] text-balance">
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
