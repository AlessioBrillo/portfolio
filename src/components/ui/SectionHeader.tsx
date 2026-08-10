import type { ReactElement } from 'react';
import { Eyebrow, type EyebrowTone } from '@/components/ui/Eyebrow';

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Passed to the Eyebrow so it matches the band's surface (light/dark). */
  tone?: EyebrowTone;
}

/** Consistent header across every band: mono eyebrow + display H2 + optional intro. */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  tone = 'light',
}: SectionHeaderProps): ReactElement {
  return (
    <header className="flex flex-col gap-4">
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2 className="font-display text-[length:var(--text-h2)] font-medium leading-[1.1]">
        {title}
      </h2>
      {intro ? (
        <p className="max-w-2xl text-[length:var(--text-body)] leading-relaxed">{intro}</p>
      ) : null}
    </header>
  );
}
