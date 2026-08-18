import { Suspense, lazy, useEffect, useMemo, useRef, type ReactElement } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CaseStudyErrorBoundary } from '@/components/CaseStudyErrorBoundary';
import {
  getCaseStudy,
  getPublishedCaseStudies,
  isPublishedStudy,
} from '@/content/case-studies/registry';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { canonicalOrigin } from '@/lib/site';
import { cn } from '@/lib/utils';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { NotFoundPage } from '@/pages/NotFoundPage';
import type { CaseStudyMeta } from '@/types/domain';

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

interface StudyNav {
  readonly prev?: CaseStudyMeta;
  readonly next?: CaseStudyMeta;
}

/** The neighbours of a study in the curated published order (registry). */
function studyNavigation(slug: string): StudyNav {
  const all = getPublishedCaseStudies();
  const index = all.findIndex((meta) => meta.slug === slug);
  if (index === -1) return {};
  return {
    prev: index > 0 ? all[index - 1] : undefined,
    next: index < all.length - 1 ? all[index + 1] : undefined,
  };
}

function StudyNavLink({
  label,
  study,
  align = 'start',
}: {
  label: 'Previous study' | 'Next study';
  study: CaseStudyMeta;
  align?: 'start' | 'end';
}): ReactElement {
  return (
    <Link
      to={`/${study.domain}/${study.slug}`}
      className={cn(
        'group flex flex-col gap-2 no-underline',
        align === 'end' ? 'sm:items-end sm:text-right' : 'sm:items-start',
      )}
    >
      <span className="font-mono text-xs uppercase tracking-widest text-ink-soft">{label}</span>
      <span className="font-display text-[length:var(--text-h3)] font-medium text-ink transition-colors group-hover:text-orange">
        {study.title}
      </span>
    </Link>
  );
}

/** Renders a single case study from its MDX body at `/{domain}/{slug}`. */
export function CaseStudyPage(): ReactElement {
  const { domain, slug } = useParams();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousSlug = useRef(slug);
  const entry = slug ? getCaseStudy(slug) : undefined;
  const valid = entry !== undefined && domain === entry.meta.domain;
  const Body = useMemo(() => (entry ? lazy(entry.load) : null), [entry]);
  const nav = useMemo(() => (valid && slug ? studyNavigation(slug) : {}), [valid, slug]);
  const origin = canonicalOrigin();

  // Prev/next navigation unmounts the link that held focus, dropping it to the
  // body (WCAG 2.4.3). Move it to the study heading on slug *change* only —
  // a deep-link load keeps the natural initial focus.
  useEffect(() => {
    if (valid && previousSlug.current !== slug) {
      headingRef.current?.focus();
    }
    previousSlug.current = slug;
  }, [valid, slug]);

  useDocumentMeta(
    valid
      ? {
          title: entry.meta.title,
          description: entry.meta.summary,
          canonical: origin ? `${origin}/${entry.meta.domain}/${entry.meta.slug}` : undefined,
          robots: isPublishedStudy(entry.meta.slug) ? undefined : 'noindex',
        }
      : { title: 'Lost altitude' },
  );

  if (!valid || !Body) {
    return <NotFoundPage />;
  }

  const { meta } = entry;

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
          <Eyebrow>
            {[meta.role, meta.year, meta.stack.length > 0 ? meta.stack.join(' / ') : '']
              .filter(Boolean)
              .join(' \u00B7 ')}
          </Eyebrow>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-[length:var(--text-h2)] font-medium leading-tight"
          >
            {meta.title}
          </h1>
        </header>
        <article className="mt-12 flex flex-col gap-6 text-[length:var(--text-body)] leading-relaxed">
          <CaseStudyErrorBoundary key={`${entry.meta.domain}/${entry.meta.slug}`}>
            <Suspense fallback={<Skeleton />}>
              <Body />
            </Suspense>
          </CaseStudyErrorBoundary>
        </article>
        {nav.prev || nav.next ? (
          <nav
            aria-label="More case studies"
            className="mt-16 grid gap-10 border-t border-black/10 pt-8 sm:grid-cols-2"
          >
            {nav.prev ? <StudyNavLink label="Previous study" study={nav.prev} /> : <span />}
            {nav.next ? <StudyNavLink label="Next study" study={nav.next} align="end" /> : <span />}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
