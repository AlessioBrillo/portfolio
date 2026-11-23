import type { ReactElement } from 'react';
import type { LegalDocument, LegalSection } from '@/types/legal';

interface LegalDocumentViewProps {
  readonly documents: readonly LegalDocument[];
}

function Section({ section, lang }: { section: LegalSection; lang: string }): ReactElement {
  return (
    <li className="py-8" id={`${lang}-${section.id}`}>
      <h2 className="font-display text-[length:var(--text-h3)] font-medium text-ink">
        {section.heading}
      </h2>
      <div className="mt-3 flex max-w-[70ch] flex-col gap-3">
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-ink-soft">
            {paragraph}
          </p>
        ))}
        {section.items ? (
          <ul className="flex list-none flex-col gap-1 p-0">
            {section.items.map((item) => (
              <li key={item} className="font-mono text-xs text-ink-soft">
                {item}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}

/**
 * Renders both language versions of a legal document on one route. Each
 * version is a real `lang`-tagged section with a stable anchor, so the
 * language switch is two plain links and needs no client-side i18n.
 */
export function LegalDocumentView({ documents }: LegalDocumentViewProps): ReactElement {
  return (
    <>
      <nav aria-label="Document language" className="flex gap-6 border-b border-ink/10 pb-4">
        {documents.map((document) => (
          <a
            key={document.lang}
            href={`#${document.lang}`}
            className="font-mono text-xs uppercase tracking-widest text-ink-soft no-underline hover:text-accent"
          >
            {document.label}
          </a>
        ))}
      </nav>
      {documents.map((document) => (
        <section key={document.lang} id={document.lang} lang={document.lang} className="mt-16">
          <h2 className="font-display text-[length:var(--text-h2)] font-medium text-ink">
            {document.title} · {document.label}
          </h2>
          <p className="mt-3 font-mono text-xs uppercase tracking-widest text-ink-soft">
            {document.intro}
          </p>
          {document.note ? (
            <p
              role="note"
              className="mt-6 border-l-[var(--hairline-thick)] border-accent pl-4 text-ink"
            >
              {document.note}
            </p>
          ) : null}
          <ol className="mt-4 flex list-none flex-col divide-y divide-ink/10 p-0">
            {document.sections.map((section) => (
              <Section key={section.id} section={section} lang={document.lang} />
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
