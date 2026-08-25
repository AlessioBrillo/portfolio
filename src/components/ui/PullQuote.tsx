import type { ReactElement, ReactNode } from 'react';
import { SCENE_SOFT_TEXT, useSceneTone } from '@/components/ascent/tone-context';

interface PullQuoteProps {
  children: ReactNode;
  cite?: string;
}

/** A large display quote for impact moments inside case studies. */
export function PullQuote({ children, cite }: PullQuoteProps): ReactElement {
  const { softTone } = useSceneTone();
  return (
    <blockquote className="border-l-[var(--hairline-thick)] border-accent pl-6">
      <p className="font-display text-[length:var(--text-h3)] font-medium leading-snug">
        <span className="text-accent">&ldquo;</span>
        {children}
      </p>
      {cite ? (
        <cite
          className={`mt-3 block font-mono text-xs uppercase tracking-widest ${SCENE_SOFT_TEXT[softTone]}`}
        >
          {cite}
        </cite>
      ) : null}
    </blockquote>
  );
}
