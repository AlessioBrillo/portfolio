import type { ReactElement } from 'react';

/**
 * Minimal top bar: name left, Contact right. The paper specifies it should
 * appear only when scrolling up and hide on the way down (roadmap Phase 3).
 * This scaffold renders the static structure without the show/hide logic.
 */
export function TopBar(): ReactElement {
  return (
    <header className="fixed inset-x-0 top-0 z-30 mix-blend-difference">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <a href="#hero" className="font-display text-base text-cream no-underline">
          Alessio Brillo
        </a>
        <a
          href="#contact"
          className="font-mono text-xs uppercase tracking-widest text-cream no-underline"
        >
          Contact
        </a>
      </div>
    </header>
  );
}
