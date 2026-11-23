import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_ROUTES } from '@/lib/legal';

/** Footer-style navigation shared by the two legal routes. */
export function LegalNav({
  current,
}: {
  current: (typeof LEGAL_ROUTES)[number]['path'];
}): ReactElement {
  return (
    <nav
      aria-label="Legal pages"
      className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink/10 pt-8"
    >
      {LEGAL_ROUTES.map((route) => (
        <Link
          key={route.path}
          to={route.path}
          aria-current={current === route.path ? 'page' : undefined}
          className="font-mono text-xs uppercase tracking-widest text-ink-soft no-underline hover:text-accent"
        >
          {route.title}
        </Link>
      ))}
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-widest text-ink-soft no-underline hover:text-accent"
      >
        &larr; Back to the ascent
      </Link>
    </nav>
  );
}
