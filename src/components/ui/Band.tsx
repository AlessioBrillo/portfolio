import type { ReactElement, ReactNode } from 'react';
import type { SectionId } from '@/types/domain';
import { cn } from '@/lib/utils';

type Tone = 'paper' | 'night';

interface BandProps {
  id: SectionId;
  ariaLabel: string;
  children: ReactNode;
  tone?: Tone;
}

/**
 * One tonal band of the ascent. The background tone is set per-section here;
 * the *continuous* scroll-driven transition between tones is the GSAP engine
 * deferred to roadmap Phase 3 (ADR-0003).
 */
export function Band({ id, ariaLabel, children, tone = 'paper' }: BandProps): ReactElement {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'scroll-mt-16 px-6 py-[var(--space-section)] transition-colors duration-[var(--duration-slow)]',
        tone === 'night' ? 'bg-night text-cream' : 'bg-paper text-ink',
      )}
    >
      <div className="mx-auto max-w-[1200px]">{children}</div>
    </section>
  );
}
