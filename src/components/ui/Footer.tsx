import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_ROUTES } from '@/lib/legal';
import { SITE, resumeLink } from '@/lib/site';

/** Minimal footer on the night band: name, one line, essential links, year. */
export function Footer(): ReactElement {
  const year = new Date().getFullYear();
  const resume = resumeLink();

  return (
    <footer className="bg-night text-phosphor">
      <div className="mx-auto flex max-w-page flex-col gap-2 px-6 py-12">
        <span className="font-display text-lg">{SITE.name}</span>
        <span className="text-sm text-phosphor-dim">{SITE.tagline}</span>
        <nav
          aria-label="External links"
          className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2"
        >
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-xs uppercase tracking-widest text-phosphor-dim no-underline transition-colors hover:text-phosphor"
          >
            GitHub
          </a>
          <a
            href={resume.href}
            {...(resume.isFile ? { target: '_blank', rel: 'noreferrer' } : {})}
            className="font-mono text-xs uppercase tracking-widest text-phosphor-dim no-underline transition-colors hover:text-phosphor"
          >
            {resume.label}
          </a>
        </nav>
        <nav aria-label="Legal links" className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {LEGAL_ROUTES.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className="font-mono text-xs uppercase tracking-widest text-phosphor-dim no-underline transition-colors hover:text-phosphor"
            >
              {route.title}
            </Link>
          ))}
        </nav>
        <span className="mt-4 font-mono text-xs uppercase tracking-widest text-phosphor-dim">
          &copy; {year}
        </span>
      </div>
    </footer>
  );
}
