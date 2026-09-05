import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useSceneTone } from '@/components/ascent/tone-context';
import { cn } from '@/lib/utils';

export type CardTone = 'paper' | 'night';

interface EntryCardProps {
  title: string;
  line: string;
  /** Optional mono metadata line (year, role, stack). */
  meta?: string;
  /** Optional deep link to a case-study route. */
  href?: string;
  /**
   * `paper` sits on paper-family surfaces, `night` on night-family ones. When
   * omitted the card takes its tone from the live scene's *muted* tone
   * (ADR-0012, `softTone`) so its meta line and copy stay legible while the
   * backdrop blends; outside a scene it defaults to `paper`. Only
   * fixed-surface cards (Contact) pass it.
   */
  tone?: CardTone;
}

/**
 * Telemetry card: zero radius, visible structural border, ASCII corners,
 * macro title, micro meta/description. Hover reveals accent edge.
 */
const CARD_SURFACE: Record<CardTone, string> = {
  paper: 'border-hairline-light bg-paper/80',
  night: 'border-hairline-dark bg-night/80',
};

const META_COLOR: Record<CardTone, string> = {
  paper: 'text-ink-soft',
  night: 'text-phosphor-dim',
};

const CARD_BASE = cn(
  'relative flex h-full flex-col justify-between gap-4 p-6',
  'rounded-none',
  'border-[var(--hairline-thick)]',
  'transition-[transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-sharp)]',
  'hover:-translate-y-2 hover:border-accent active:scale-[0.98] active:translate-y-[1px]',
  'ascii-corners',
);

/** A project or study card in the cruise bands; links when a route exists. */
export function EntryCard({ title, line, meta, href, tone }: EntryCardProps): ReactElement {
  const sceneTone = useSceneTone();
  const effectiveTone: CardTone = tone ?? (sceneTone.softTone === 'night' ? 'night' : 'paper');
  const classes = cn(CARD_BASE, CARD_SURFACE[effectiveTone]);

  const content = (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[length:var(--text-h3)] font-medium leading-[var(--leading-snug)] tracking-[var(--tracking-tight-sm)] text-balance text-current">
            {title}
          </h3>
          {meta ? (
            <span
              className={cn(
                'shrink-0 font-mono text-[length:var(--text-micro-sm)] uppercase tracking-[var(--tracking-widest)]',
                META_COLOR[effectiveTone],
              )}
            >
              {meta}
            </span>
          ) : null}
        </div>
        <p
          className={cn(
            'font-sans text-[length:var(--text-body-sm)] leading-[var(--leading-relaxed)]',
            META_COLOR[effectiveTone],
          )}
        >
          {line}
        </p>
      </div>
    </>
  );

  return href ? (
    <Link to={href} className={cn(classes, 'block no-underline text-current')}>
      {content}
    </Link>
  ) : (
    <article className={classes}>{content}</article>
  );
}
