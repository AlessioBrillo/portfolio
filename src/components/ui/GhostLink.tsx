import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GhostLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

/** Brutalist data link: mono, uppercase, tracking, prepends >>> on hover. */
export function GhostLink({ children, className, ...props }: GhostLinkProps): ReactElement {
  return (
    <a
      className={cn(
        'inline-flex items-center gap-1 font-mono text-[length:var(--text-micro)] uppercase tracking-[var(--tracking-wide)] text-current no-underline',
        'hover:text-accent active:scale-[0.98]',
        'before:content-[">>>_"] before:opacity-0 before:transition-opacity before:duration-[var(--duration-fast)] hover:before:opacity-100',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
