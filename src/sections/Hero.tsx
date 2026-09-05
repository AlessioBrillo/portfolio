import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { REVEAL_OFFSET_PX } from '@/lib/animation';
import { SITE } from '@/lib/site';

interface HeroProps {
  surface?: Surface;
}

/**
 * 00 — The thesis. A mono instrument reading, the name at display scale, then a
 * one-line manifesto. Editorial scale contrast carries the hierarchy; the lone
 * orange tick echoes the altitude gauge's position marker. Copy direction lives
 * in docs/content/sections.md.
 *
 * Contrast (measured): the eyebrow defaults to `ink-soft` (8.3:1) and the
 * manifesto is ink (~13:1) on paper — both clear AA.
 *
 * Entrance animation uses CSS keyframes (hero-rise) with staggered delays,
 * respecting prefers-reduced-motion. Replaces Framer Motion for bundle size.
 */
export function Hero({ surface = 'scene' }: HeroProps): ReactElement {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Band
      id="hero"
      ariaLabel="Introduction"
      tone="paper"
      surface={surface}
      style={{ '--reveal-offset-px': `${REVEAL_OFFSET_PX}px` } as React.CSSProperties}
    >
      <div className="flex min-h-[80vh] flex-col justify-center gap-8">
        <p
          className={`flex items-center gap-3 hero-rise ${prefersReducedMotion ? 'animate-none opacity-100' : ''}`}
        >
          <span aria-hidden className="h-px w-8 bg-accent" />
          <Eyebrow as="data">[ 45.6306° N · 8.7281° E — VDS ]</Eyebrow>
        </p>

        <h1
          className={`font-display text-[length:var(--text-macro)] font-medium leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-balance hero-rise ${prefersReducedMotion ? 'animate-none opacity-100' : ''}`}
        >
          {SITE.name.toUpperCase()}
        </h1>

        <p
          className={`max-w-[60ch] font-sans text-[length:var(--text-body)] leading-[var(--leading-relaxed)] text-ink hero-rise ${prefersReducedMotion ? 'animate-none opacity-100' : ''}`}
        >
          Student of AI and physics. I build things, fly small aircraft, and chase the next hard
          problem.
        </p>
      </div>
    </Band>
  );
}
