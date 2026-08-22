import type { ReactElement } from 'react';
import { Eyebrow, type EyebrowTone } from '@/components/ui/Eyebrow';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string;
  /**
   * Optional eyebrow tone. Omitted (the default) lets the eyebrow derive
   * from the live scene tone (ADR-0012) so it flips with the backdrop;
   * only fixed-surface sections (Contact's solid night) pass it.
   */
  tone?: EyebrowTone;
}

/**
 * Brutalist sector header: ASCII-framed eyebrow, macro H2, structural rule,
 * micro intro. Zero decoration, pure hierarchy.
 */
export function SectionHeader({ eyebrow, title, intro, tone }: SectionHeaderProps): ReactElement {
  return (
    <header className="flex flex-col gap-4">
      <Eyebrow tone={tone} className="mb-1" as="data">
        [{eyebrow}]
      </Eyebrow>
      <h2
        data-tone-trigger
        className="font-display text-[length:var(--text-sector)] font-black leading-[0.9] tracking-[-0.04em] text-balance uppercase"
      >
        {title.toUpperCase()}
      </h2>
      <hr
        className="hr-structural hr-structural-light dark:hr-structural-dark"
        aria-hidden="true"
      />
      {intro ? (
        <p className="font-mono text-[length:var(--text-micro)] leading-[var(--leading-normal)] tracking-[var(--tracking-wider)] uppercase max-w-3xl">
          {intro}
        </p>
      ) : null}
    </header>
  );
}
