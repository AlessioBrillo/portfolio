import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { getArchiveEntries } from '@/content/archive';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { canonicalOrigin } from '@/lib/site';

/**
 * The experiences archive (ADR-0019): "dig deeper" behind the curated band —
 * the chronological record of everything the site shows, newest first. A
 * projection over the content modules, so it stays truthful without edits of
 * its own. Paper surface, outside the tonal flight (like every non-home
 * route, ADR-0001).
 */
export function ArchivePage(): ReactElement {
  const entries = getArchiveEntries();
  const origin = canonicalOrigin();

  useDocumentMeta({
    title: 'The archive',
    description:
      'The chronological record behind the curated surface — every study, project and story, newest first.',
    canonical: origin ? `${origin}/archive` : undefined,
  });

  return (
    <main className="bg-paper text-ink">
      <div className="mx-auto max-w-[760px] px-6 py-[var(--space-section)]">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-ink-soft no-underline"
        >
          &larr; Back to the ascent
        </Link>
        <header className="mt-8 flex flex-col gap-4">
          <Eyebrow>06 — Experiences &middot; The archive</Eyebrow>
          <h1 className="font-display text-[length:var(--text-h2)] font-medium leading-tight text-balance">
            The archive
          </h1>
        </header>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-ink-soft">
          The chronological record behind the curated surface — every study, project and story this
          site shows, newest first.
        </p>
        <ol className="mt-12 flex list-none flex-col divide-y divide-ink/10 p-0">
          {entries.map((entry) => (
            <li
              key={`${entry.kind}-${entry.title}`}
              className="flex flex-col gap-1 py-6 sm:flex-row sm:gap-6"
            >
              {entry.year ? (
                <span className="shrink-0 font-mono text-xs uppercase tracking-widest text-ink-soft sm:w-24 sm:pt-2">
                  {entry.year}
                </span>
              ) : null}
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-[length:var(--text-h3)] font-medium">
                  {entry.href ? (
                    <Link
                      to={entry.href}
                      className="no-underline transition-colors hover:text-accent"
                    >
                      {entry.title}
                    </Link>
                  ) : (
                    entry.title
                  )}
                </h3>
                <p className="leading-relaxed text-ink-soft">{entry.line}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
