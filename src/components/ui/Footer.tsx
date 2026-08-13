import type { ReactElement } from 'react';
import { SITE } from '@/lib/site';

/** Minimal footer on the night band: name, one line, essential links, year. */
export function Footer(): ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-cream">
      <div className="mx-auto flex max-w-page flex-col gap-2 px-6 py-12">
        <span className="font-display text-lg">{SITE.name}</span>
        <span className="text-sm text-muted-dark">{SITE.tagline}</span>
        <nav
          aria-label="External links"
          className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-muted-dark no-underline transition-colors hover:text-cream"
          >
            GitHub
          </a>
          <a
            href={SITE.resumeUrl}
            className="font-mono text-xs uppercase tracking-widest text-muted-dark no-underline transition-colors hover:text-cream"
          >
            Resume &mdash; on request
          </a>
        </nav>
        <span className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-dark">
          &copy; {year}
        </span>
      </div>
    </footer>
  );
}
