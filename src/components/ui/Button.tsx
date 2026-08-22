import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * Brutalist actuator: zero radius, solid accent red, macro label, border flash on hover.
 * Reserved for the final CTA only. `ink`-on-accent clears AA (4.83:1).
 */
export function Button({
  children,
  className,
  type = 'button',
  ...props
}: ButtonProps): ReactElement {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-none bg-accent px-8 py-4',
        'font-display text-[length:var(--text-micro)] font-black uppercase tracking-[var(--tracking-wide)] text-ink',
        'border-[var(--hairline-thick)] border-transparent',
        'transition-[transform,border-color] duration-[var(--duration-fast)] ease-[var(--ease-sharp)]',
        'hover:border-ink hover:-translate-y-1 active:scale-[0.98] active:translate-y-[1px]',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
