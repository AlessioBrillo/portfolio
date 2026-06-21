import type { ReactElement, ReactNode } from 'react';

interface PullQuoteProps {
  children: ReactNode;
  cite?: string;
}

/** A large display quote for impact moments inside case studies. */
export function PullQuote({ children, cite }: PullQuoteProps): ReactElement {
  return (
    <blockquote className="border-l-2 border-orange pl-6">
      <p className="font-display text-[length:var(--text-h3)] font-medium leading-snug">
        <span className="text-orange">&ldquo;</span>
        {children}
      </p>
      {cite ? (
        <cite className="mt-3 block font-mono text-xs uppercase tracking-widest text-muted-light">
          {cite}
        </cite>
      ) : null}
    </blockquote>
  );
}
