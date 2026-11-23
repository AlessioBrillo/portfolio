import type { ReactElement } from 'react';

/**
 * Visible scope note for the aviation studies. The figures in those stories
 * are derived for learning, not for operational use; the note is a component
 * so both studies carry exactly the same wording and can never drift apart.
 */
export function StudyDisclaimer(): ReactElement {
  return (
    <aside
      role="note"
      aria-label="Scope of this study"
      className="border-l-[var(--hairline-thick)] border-accent bg-paper-elevated px-5 py-4"
    >
      <strong className="font-mono text-xs font-medium uppercase tracking-widest text-ink">
        Educational use only
      </strong>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        The figures and examples in this study are illustrative and derived for learning. They are
        not operational instructions and must not be used to plan or execute a flight. Use official
        manuals and a qualified instructor for aviation training.
      </p>
    </aside>
  );
}
