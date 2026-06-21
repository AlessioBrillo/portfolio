import type { ReactElement } from 'react';

/** Minimal footer on the night band: name, one line, essential links, year. */
export function Footer(): ReactElement {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-cream">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-2 px-6 py-12">
        <span className="font-display text-lg">Alessio Brillo</span>
        <span className="text-sm text-muted-dark">
          Student of AI and physics — building, flying, learning.
        </span>
        <span className="mt-4 font-mono text-xs uppercase tracking-widest text-muted-dark">
          &copy; {year}
        </span>
      </div>
    </footer>
  );
}
