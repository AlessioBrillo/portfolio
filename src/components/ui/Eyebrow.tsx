import type { ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mono, uppercase, letter-spaced label. By convention it carries real data
 * (dates, coordinates, altitude, stack) rather than decorative text.
 */
export function Eyebrow({ children, className }: EyebrowProps): ReactElement {
  return (
    <span
      className={cn(
        'font-mono text-[length:var(--text-eyebrow)] font-medium uppercase tracking-[0.18em]',
        'text-muted-light',
        className,
      )}
    >
      {children}
    </span>
  );
}
