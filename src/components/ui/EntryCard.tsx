import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export type CardTone = 'light' | 'dark';

interface EntryCardProps {
  title: string;
  line: string;
  /** Optional mono metadata line (year, role, stack). */
  meta?: string;
  /** Optional deep link to a case-study route. */
  href?: string;
  /** Matches the band's tone so borders and tints stay AA-safe. */
  tone?: CardTone;
}

/**
 * Card surface for the cruise bands (04 Work & School, 03 AI & Physics). An
 * `<article>` inside an `<a>` makes the link's accessible name compute to
 * empty (Chrome), so the anchor itself carries the card surface and its text
 * stays inside it — the same pattern as `MosaicTile`.
 */
const CARD_SURFACE: Record<CardTone, string> = {
  light: 'border-black/10 bg-cream/60',
  dark: 'border-white/10 bg-white/5',
};

const META_COLOR: Record<CardTone, string> = {
  light: 'text-ink-soft',
  dark: 'text-muted-dark',
};

/** A project or study card in the cruise bands; links when a route exists. */
export function EntryCard({
  title,
  line,
  meta,
  href,
  tone = 'light',
}: EntryCardProps): ReactElement {
  const classes = cn(
    'flex h-full flex-col justify-between gap-6 rounded-[var(--radius-card)] border p-6',
    'transition-[transform,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]',
    'hover:-translate-y-1 hover:border-orange',
    CARD_SURFACE[tone],
  );

  const content = (
    <>
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[length:var(--text-h3)] font-medium text-current">
            {title}
          </h3>
          {meta ? (
            <span
              className={cn(
                'shrink-0 font-mono text-xs uppercase tracking-widest',
                META_COLOR[tone],
              )}
            >
              {meta}
            </span>
          ) : null}
        </div>
        <p className={cn('text-sm leading-relaxed', META_COLOR[tone])}>{line}</p>
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
