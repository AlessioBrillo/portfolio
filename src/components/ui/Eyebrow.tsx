import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type EyebrowTone = 'light' | 'dark';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  /**
   * `light` sits on paper-family surfaces (default), `dark` on night-family
   * ones. The two tones carry the same muted-but-legible role: each measures
   * well past WCAG AA against its own surface (8.3:1 / 4.8:1).
   */
  tone?: EyebrowTone;
}

/**
 * Mono, uppercase, letter-spaced label. By convention it carries real data
 * (dates, coordinates, altitude, stack) rather than decorative text.
 */
export function Eyebrow({ children, className, tone = 'light' }: EyebrowProps): ReactElement {
  return (
    <span
      className={cn(
        'font-mono text-[length:var(--text-eyebrow)] font-medium uppercase tracking-[0.18em]',
        tone === 'light' ? 'text-ink-soft' : 'text-muted-dark',
        className,
      )}
    >
      {children}
    </span>
  );
}
