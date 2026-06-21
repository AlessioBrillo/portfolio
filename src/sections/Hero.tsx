import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { Eyebrow } from '@/components/ui/Eyebrow';

/** 00 — The thesis. Name + one-line manifesto. (Copy direction: docs/content/sections.md) */
export function Hero(): ReactElement {
  return (
    <Band id="hero" ariaLabel="Introduction" tone="paper">
      <div className="flex min-h-[70vh] flex-col justify-center gap-6">
        <Eyebrow>45.6306&deg; N &middot; 8.7281&deg; E — VDS</Eyebrow>
        <h1 className="font-display text-[length:var(--text-hero)] font-medium leading-[1.02]">
          Alessio Brillo
        </h1>
        <p className="max-w-3xl text-[length:var(--text-body)] leading-relaxed text-muted-light">
          Student of AI and physics. I build things, fly small aircraft, and chase the next hard
          problem.
        </p>
      </div>
    </Band>
  );
}
