import type { ComponentPropsWithoutRef, ReactElement, ReactNode } from 'react';
import { useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

export type EyebrowTone = 'light' | 'dark';

interface EyebrowProps extends ComponentPropsWithoutRef<'span'> {
  children: ReactNode;
  /**
   * `light` sits on carta-family surfaces, `dark` on notte-family ones. When
   * omitted, the label takes its tone from the live scene's *muted* tone
   * (ADR-0012, `softTone` — the muted family flips at its own
   * equal-legibility line, later than the body) so it stays legible while
   * the backdrop blends; outside a scene it defaults to `light`.
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
  const effectiveTone: EyebrowTone = tone ?? (sceneTone.softTone === 'notte' ? 'dark' : 'light');
  const textClass = effectiveTone === 'light' ? 'text-ink-soft' : 'text-panna-dim';
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
