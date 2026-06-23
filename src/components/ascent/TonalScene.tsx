import { useRef, useState, type ReactElement, type ReactNode } from 'react';
import { motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FADE_STOPS, TONE, toneAt, type ToneName } from '@/lib/tone';

interface TonalSceneProps {
  children: ReactNode;
}

/**
 * The signature crossfade: a fixed backdrop whose colour flies from `paper`
 * (ground) to `night` (cruise above the cloud deck) as the user scrolls through
 * the wrapped sections. Those sections must use `<Band surface="scene">` so the
 * backdrop shows through.
 *
 * Motion path: Framer Motion `useScroll` over this scene's own progress drives
 * `useTransform` across `FADE_STOPS`. Reduced-motion path: the colour switches
 * instantly at the cloud deck (ADR-0009), no interpolation.
 *
 * This is Phase 2's single transition. The full multi-band GSAP engine is
 * Phase 3 (ADR-0003); the boundary math lives in `@/lib/tone`.
 */
export function TonalScene({ children }: TonalSceneProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const animatedBackground = useTransform(
    scrollYProgress,
    [...FADE_STOPS],
    [TONE.paper, TONE.paper, TONE.night, TONE.night],
  );

  const [instantTone, setInstantTone] = useState<ToneName>('paper');
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (prefersReducedMotion) setInstantTone(toneAt(value));
  });

  return (
    <div ref={ref} className="relative">
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={
          prefersReducedMotion
            ? { backgroundColor: TONE[instantTone] }
            : { backgroundColor: animatedBackground }
        }
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
