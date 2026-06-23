import type { ReactElement } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Band, type Surface } from '@/components/ui/Band';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { EASE_OUT_EXPO, REVEAL_OFFSET_PX } from '@/lib/animation';

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
 * Contrast: the eyebrow is ink/70 (~5.7:1) and the manifesto is ink (~13:1) on
 * paper — both clear AA. `muted-light` is avoided here because it fails AA as
 * body text on paper.
 */
export function Hero({ surface = 'solid' }: HeroProps): ReactElement {
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
          <span aria-hidden className="h-px w-8 bg-orange" />
          <Eyebrow className="text-ink/70">45.6306&deg; N &middot; 8.7281&deg; E — VDS</Eyebrow>
        </motion.p>

        <motion.h1
          className="font-display text-[length:var(--text-hero)] font-medium leading-[1.02] tracking-[-0.02em] text-balance"
          variants={rise}
        >
          Alessio Brillo
        </motion.h1>

        <motion.p
          className="max-w-[60ch] text-[length:var(--text-body)] leading-relaxed text-ink"
          variants={rise}
        >
          Student of AI and physics. I build things, fly small aircraft, and chase the next hard
          problem.
        </motion.p>
      </motion.div>
    </Band>
  );
}
