import type { ReactElement } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Band, type Surface } from '@/components/ui/Band';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_EXPO, REVEAL_OFFSET_PX } from '@/lib/animation';
import { SITE } from '@/lib/site';

interface HeroProps {
  surface?: Surface;
}

const container: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: REVEAL_OFFSET_PX },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

/**
 * 00 — The thesis. A mono instrument reading, the name at display scale, then a
 * one-line manifesto. Editorial scale contrast carries the hierarchy; the lone
 * orange tick echoes the altitude gauge's position marker. Copy direction lives
 * in docs/content/sections.md.
 *
 * Contrast (measured): the eyebrow defaults to `ink-soft` (8.3:1) and the
 * manifesto is ink (~13:1) on paper — both clear AA.
 */
export function Hero({ surface = 'scene' }: HeroProps): ReactElement {
  const prefersReducedMotion = useReducedMotion();
  const motionState = prefersReducedMotion ? 'shown' : undefined;

  return (
    <Band id="hero" ariaLabel="Introduction" tone="paper" surface={surface}>
      <motion.div
        className="flex min-h-[80vh] flex-col justify-center gap-8"
        variants={container}
        initial={motionState ?? 'hidden'}
        animate={motionState ?? 'shown'}
      >
        <motion.p className="flex items-center gap-3" variants={rise}>
          <span aria-hidden className="h-px w-8 bg-accent" />
          <Eyebrow as="data">[ 45.6306° N · 8.7281° E — VDS ]</Eyebrow>
        </motion.p>

        <motion.h1
          className="font-display text-[length:var(--text-macro)] font-medium leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-balance"
          variants={rise}
        >
          {SITE.name.toUpperCase()}
        </motion.h1>

        <motion.p
          className="max-w-[60ch] font-sans text-[length:var(--text-body)] leading-[var(--leading-relaxed)] text-ink"
          variants={rise}
        >
          Student of AI and physics. I build things, fly small aircraft, and chase the next hard
          problem.
        </motion.p>
      </motion.div>
    </Band>
  );
}
