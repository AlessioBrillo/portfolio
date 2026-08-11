import type { ReactElement, ReactNode } from 'react';
import { useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

export type EyebrowTone = 'light' | 'dark';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  /**
   * `light` sits on paper-family surfaces, `dark` on night-family ones. When
   * omitted, the label takes its tone from the live scene tone (ADR-0011) so
   * it stays legible while the backdrop blends; outside a scene it defaults
   * to `light`. The two tones carry the same muted-but-legible role: each
   * measures well past WCAG AA against its own surface (8.3:1 / 4.8:1).
   */
  tone?: EyebrowTone;
}

/**
 * Mono, uppercase, letter-spaced label. By convention it carries real data
 * (dates, coordinates, altitude, stack) rather than decorative text.
 */
export function Eyebrow({ children, className, tone }: EyebrowProps): ReactElement {
  const sceneTone = useSceneTone();
  const effectiveTone: EyebrowTone = tone ?? (sceneTone.tone === 'night' ? 'dark' : 'light');
  return (
    <span
      className={cn(
        'font-mono text-[length:var(--text-eyebrow)] font-medium uppercase tracking-[0.18em]',
        effectiveTone === 'light' ? 'text-ink-soft' : 'text-muted-dark',
        className,
      )}
    >
      {children}
    </span>
  );
}
