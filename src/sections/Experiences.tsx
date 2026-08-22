import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SCENE_SOFT_TEXT, useSceneTone } from '@/components/ascent/tone-context';
import { getExperienceEntries } from '@/content/experiences';

interface ExperiencesProps {
  surface?: Surface;
}

/** 06 — Curated storytelling; "dig deeper" opens the chronological archive (ADR-0019). */
export function Experiences({ surface = 'solid' }: ExperiencesProps): ReactElement {
  const { softTone } = useSceneTone();
  return (
    <Band id="experiences" ariaLabel="Experiences" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="SECTOR 06 · ARCHIVE ACCESS · N RECORDS"
        title="ARCHIVE: CURATED STORYTELLING"
        intro="WHAT I CHOOSE TO SHOW, TOLD SHORT — THE ARCHIVE HOLDS THE FULL RECORD."
      />
      <ol className="mt-12 flex list-none flex-col divide-y divide-ink/10 p-0">
        {getExperienceEntries().map((entry) => (
          <li key={entry.id} className="flex flex-col gap-1 py-6 sm:flex-row sm:gap-6">
            {entry.year ? (
              <span
                className={`shrink-0 font-mono text-[length:var(--text-micro-sm)] uppercase tracking-[var(--tracking-widest)] ${SCENE_SOFT_TEXT[softTone]} sm:w-24 sm:pt-2`}
              >
                {entry.year}
              </span>
            ) : null}
            <div className="flex flex-col gap-1">
              <h3 className="font-display text-[length:var(--text-h3)] font-black leading-[1.1] tracking-[-0.02em] text-balance">
                {entry.title}
              </h3>
              <p
                className={`font-sans text-[length:var(--text-body-sm)] leading-[var(--leading-relaxed)] ${SCENE_SOFT_TEXT[softTone]}`}
              >
                {entry.line}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <Link
        to="/archive"
        className="group inline-flex items-center gap-1 mt-10 font-mono text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-wide)] text-current no-underline hover:text-accent active:scale-[0.98] before:content-['»»»_'] before:opacity-0 before:transition-opacity before:duration-[var(--duration-fast)] hover:before:opacity-100"
      >
        DIG DEEPER — THE ARCHIVE
      </Link>
    </Band>
  );
}
