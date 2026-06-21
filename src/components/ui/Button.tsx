import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

/**
 * The single primary action of the site (reserved for the final CTA).
 * Solid orange, cream text, soft radius, subtle lift on hover.
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
        'inline-flex items-center justify-center rounded-[var(--radius-soft)] bg-orange px-6 py-3',
        'font-sans text-base font-medium text-cream',
        'transition-[transform,filter] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)]',
        'hover:-translate-y-0.5 hover:brightness-95 active:translate-y-0',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
