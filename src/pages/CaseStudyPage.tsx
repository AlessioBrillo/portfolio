import { Suspense, lazy, useEffect, useMemo, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getCaseStudy } from '@/content/case-studies/registry';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { NotFoundPage } from '@/pages/NotFoundPage';

function Skeleton(): ReactElement {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading case study">
      <div className="h-4 w-3/4 animate-pulse rounded bg-black/10" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-black/10" />
      <div className="h-4 w-full animate-pulse rounded bg-black/10" />
      <div className="h-4 w-5/6 animate-pulse rounded bg-black/10" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
    </div>
  );
}

/** Renders a single case study from its MDX body at `/{domain}/{slug}`. */
export function CaseStudyPage(): ReactElement {
  const { slug } = useParams();
  const entry = slug ? getCaseStudy(slug) : undefined;
  const Body = useMemo(() => (entry ? lazy(entry.load) : null), [entry]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!entry || !Body) {
    return <NotFoundPage />;
  }

  const { meta } = entry;

  return (
    <main className="bg-paper text-ink">
      <div className="mx-auto max-w-[760px] px-6 py-[var(--space-section)]">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-muted-light no-underline"
        >
          &larr; Back to the ascent
        </Link>
        <header className="mt-8 flex flex-col gap-4">
          <Eyebrow>
            {[meta.role, meta.year, meta.stack.length > 0 ? meta.stack.join(' / ') : '']
              .filter(Boolean)
              .join(' \u00B7 ')}
          </Eyebrow>
          <h1 className="font-display text-[length:var(--text-h2)] font-medium leading-tight">
            {meta.title}
          </h1>
        </header>
        <article className="mt-12 flex flex-col gap-6 text-[length:var(--text-body)] leading-relaxed">
          <Suspense fallback={<Skeleton />}>
            <Body />
          </Suspense>
        </article>
      </div>
    </main>
  );
}
