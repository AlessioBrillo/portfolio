import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

export type EyebrowTone = 'paper' | 'night';

interface EyebrowProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  /**
   * `paper` sits on paper-family surfaces, `night` on night-family ones. When
   * omitted, the label takes its tone from the live scene's *muted* tone
   * (ADR-0012, `softTone` — the muted family flips at its own
   * equal-legibility line, later than the body) so it stays legible while
   * the backdrop blends; outside a scene it defaults to `paper`.
   */
  tone?: EyebrowTone;
  /** Semantic element: 'data' for telemetry, 'samp' for output, 'kbd' for input. Default 'span'. */
  as?: 'span' | 'data' | 'samp' | 'kbd';
}

/**
 * Editorial telemetry label: mono, uppercase, generous tracking, semantic element.
 * Carries real data (coordinates, dates, altitude, stack) — never decoration.
 */
export function Eyebrow({
  children,
  className,
  tone,
  as: Component = 'span',
  ...props
}: EyebrowProps): ReactElement {
  const sceneTone = useSceneTone();
  const effectiveTone: EyebrowTone = tone ?? (sceneTone.softTone === 'night' ? 'night' : 'paper');
  const textClass = effectiveTone === 'paper' ? 'text-ink-soft' : 'text-phosphor-dim';
  return (
    <Component
      className={cn(
        'font-mono text-[length:var(--text-micro)] font-medium uppercase tracking-[var(--tracking-widest)]',
        textClass,
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
