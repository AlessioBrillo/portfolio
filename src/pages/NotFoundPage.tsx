import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { Eyebrow } from '@/components/ui/Eyebrow';

/** 404 in voice (paper section 9). */
export function NotFoundPage(): ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night px-6 text-center text-cream">
      <Eyebrow>404</Eyebrow>
      <h1 className="font-display text-[length:var(--text-h2)] font-medium">Lost altitude.</h1>
      <p className="text-muted-dark">Let&apos;s get you back to ground.</p>
      <Link to="/" className="font-mono text-xs uppercase tracking-widest text-orange no-underline">
        Return to ground &rarr;
      </Link>
    </main>
  );
}
