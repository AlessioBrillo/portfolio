import type { ReactElement, ReactNode, CSSProperties } from 'react';
import type { SectionId } from '@/types/domain';
import { useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

type Tone = 'paper' | 'night';

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
  style?: CSSProperties;
}

/**
 * One tonal band of the ascent. A `solid` band paints its own background; a
 * `scene` band defers its background to a `TonalScene` so the tone can crossfade
 * on scroll (ADR-0003, ADR-0010), and reads the live scene tone for its text
 * colour (ADR-0011).
 *
 * Uses design tokens: --color-ink, --color-phosphor, --color-paper, --color-night,
 * --color-hairline-light, --color-hairline-dark.
 */
export function Band({
  id,
  ariaLabel,
  children,
  tone = 'paper',
  surface = 'solid',
  style,
}: BandProps): ReactElement {
  const sceneTone = useSceneTone();
  const effectiveTone = surface === 'scene' ? sceneTone.tone : tone;
  const isNight = effectiveTone === 'night';
  const text = isNight ? 'text-phosphor' : 'text-ink';
  const background = surface === 'scene' ? 'bg-transparent' : isNight ? 'bg-night' : 'bg-paper';
  const hairline = isNight ? 'border-hairline-dark' : 'border-hairline-light';

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
      style={style}
    >
      <div className="mx-auto max-w-page grid-blueprint">{children}</div>
    </section>
  );
}
