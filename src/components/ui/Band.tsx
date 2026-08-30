import type { ReactElement, ReactNode } from 'react';
import type { SectionId } from '@/types/domain';
import { useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

type Tone = 'carta' | 'notte';

/**
 * `solid` paints its own background tone (the default, used by bands outside an
 * animated transition). `scene` stays transparent so a `TonalScene` backdrop
 * can crossfade behind it -- the band then takes its text colour from the
 * *live* scene tone (ADR-0011) instead of the static `tone` prop, so text
 * stays legible as the backdrop blends.
 */
export type Surface = 'solid' | 'scene';

interface BandProps {
  id: SectionId;
  ariaLabel: string;
  children: ReactNode;
  tone?: Tone;
  surface?: Surface;
}

/**
 * One tonal band of the ascent. A `solid` band paints its own background; a
 * `scene` band defers its background to a `TonalScene` so the tone can crossfade
 * on scroll (ADR-0003, ADR-0010), and reads the live scene tone for its text
 * colour (ADR-0011).
 *
 * Uses design tokens: --color-ink, --color-panna, --color-carta, --color-notte,
 * --color-hairline-light, --color-hairline-dark.
 */
export function Band({
  id,
  ariaLabel,
  children,
  tone = 'carta',
  surface = 'solid',
}: BandProps): ReactElement {
  const sceneTone = useSceneTone();
  const effectiveTone = surface === 'scene' ? sceneTone.tone : tone;
  const isNotte = effectiveTone === 'notte';
  const text = isNotte ? 'text-panna' : 'text-ink';
  const background = surface === 'scene' ? 'bg-transparent' : isNotte ? 'bg-notte' : 'bg-carta';
  const hairline = isNotte ? 'border-hairline-dark' : 'border-hairline-light';

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'scroll-mt-16 px-6 py-[var(--space-section)]',
        background,
        text,
        'border-y',
        hairline,
      )}
    >
      <div className="mx-auto max-w-page grid-blueprint">{children}</div>
    </section>
  );
}
