import type { ReactElement } from 'react';
import { Eyebrow, type EyebrowTone } from '@/components/ui/Eyebrow';
import { useSceneTone } from '@/components/ascent/tone-context';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string;
  /**
   * Optional tone. Omitted (the default) lets the eyebrow and rule derive
   * from the live scene tone (ADR-0012) so they flip with the backdrop;
   * only fixed-surface sections (Contact's solid notte) pass it.
   */
  tone?: EyebrowTone;
}

/**
 * Sector header: ASCII-framed eyebrow, macro H2, structural rule,
 * micro intro. Zero decoration, pure hierarchy.
 * Uses design tokens for structural rule color.
 */
export function SectionHeader({ eyebrow, title, intro, tone }: SectionHeaderProps): ReactElement {
  const sceneTone = useSceneTone();
  const effectiveTone: EyebrowTone = tone ?? (sceneTone.softTone === 'notte' ? 'dark' : 'light');
  const hrClass = effectiveTone === 'dark' ? 'hr-structural-dark' : 'hr-structural-light';

  return (
    <header className="flex flex-col gap-4">
      <Eyebrow tone={tone} className="mb-1" as="data">
        [{eyebrow}]
      </Eyebrow>
      <h2
        data-tone-trigger
        className="font-display text-[length:var(--text-sector)] font-medium leading-[var(--leading-snug)] tracking-[var(--tracking-tight-sm)] text-balance"
      >
        {title}
      </h2>
      <hr className={`hr-structural ${hrClass}`} aria-hidden="true" />
      {intro ? (
        <p className="font-mono text-[length:var(--text-micro)] leading-[var(--leading-normal)] tracking-[var(--tracking-wider)] uppercase max-w-3xl">
          {intro}
        </p>
      ) : null}
    </header>
  );
}
