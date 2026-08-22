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

/** Consistent header across every band: mono eyebrow + display H2 + optional intro. */
export function SectionHeader({ eyebrow, title, intro, tone }: SectionHeaderProps): ReactElement {
  return (
    <header className="flex flex-col">
      <Eyebrow tone={tone} className="mb-2">
        {eyebrow}
      </Eyebrow>
      <h2
        data-tone-trigger
        className="font-display text-[length:var(--text-h2)] font-medium leading-[1.1] text-balance mb-4"
      >
        {title}
      </h2>
      {intro ? (
        <p className="max-w-2xl text-[length:var(--text-body)] leading-relaxed mt-2">{intro}</p>
      ) : null}
    </header>
  );
}
