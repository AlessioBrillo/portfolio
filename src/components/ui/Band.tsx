import type { ReactElement, ReactNode } from 'react';
import type { SectionId } from '@/types/domain';
import { cn } from '@/lib/utils';

type Tone = 'paper' | 'night';

/**
 * `solid` paints its own background tone (the default, used by bands outside an
 * animated transition). `scene` stays transparent so a `TonalScene` backdrop
 * can crossfade behind it — the band still sets its text colour from `tone`.
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
 * on scroll (the first such transition lands in Phase 2; the full multi-band
 * GSAP engine is Phase 3, per ADR-0003 and ADR-0010).
 */
export function Band({
  id,
  ariaLabel,
  children,
  tone = 'paper',
  surface = 'solid',
}: BandProps): ReactElement {
  const text = tone === 'night' ? 'text-cream' : 'text-ink';
  const background =
    surface === 'scene' ? 'bg-transparent' : tone === 'night' ? 'bg-night' : 'bg-paper';

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'scroll-mt-16 px-6 py-[var(--space-section)] transition-colors duration-[var(--duration-slow)]',
        background,
        text,
      )}
    >
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}
