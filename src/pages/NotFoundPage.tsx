import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';

/** 404 in voice (paper section 9). */
export function NotFoundPage(): ReactElement {
  useDocumentMeta({ title: 'Lost altitude' });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night px-6 text-center text-phosphor">
      <Eyebrow tone="dark">404</Eyebrow>
      <h1 className="font-display text-[length:var(--text-h2)] font-medium text-balance">
        Lost altitude.
      </h1>
      <p className="text-phosphor-dim">Let&apos;s get you back to ground.</p>
      <Link to="/" className="font-mono text-xs uppercase tracking-widest text-accent no-underline">
        Return to ground &rarr;
      </Link>
    </main>
  );
}
