import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GhostLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
}

/** The standard link: an orange underline that draws in from the left on hover. */
export function GhostLink({ children, className, ...props }: GhostLinkProps): ReactElement {
  return (
    <a
      className={cn(
        'group relative inline-block font-sans text-current no-underline',
        'after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left',
        'after:scale-x-0 after:bg-orange after:transition-transform after:duration-[var(--duration-normal)]',
        'after:ease-[var(--ease-out-expo)] hover:after:scale-x-100',
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
