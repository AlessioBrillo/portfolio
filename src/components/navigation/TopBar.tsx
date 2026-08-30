import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useSceneTone } from '@/components/ascent/tone-context';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { isNotteSection } from '@/lib/section-tone';
import { cn } from '@/lib/utils';

/** Minimum scroll delta (px) between ticks before the bar hides/shows. */
const DIRECTION_THRESHOLD_PX = 8;

/**
 * Minimal top bar with tone-aware background and text colour.
 *
 * The bar's dark/light mode follows the *live* scene tone (ADR-0011) so the
 * chrome stays on the correct tone during the tonal blends, with explicit
 * solid-notte sections (Contact) forcing notte even when the scene reads
 * carta — `isNotteSection` covers those, the scene tone covers everything
 * else. Outside a `TonalScene` the context defaults to carta, so the bar
 * degrades to the ground tone on static pages.
 *
 * Hides on scroll-down and reveals on scroll-up to preserve immersion
 * (ADR-0006); under reduced motion it stays permanently visible (ADR-0009).
 * Movement is a compositor-friendly CSS transform, no animation library.
 * Uses design tokens: --color-ink, --color-panna, --color-carta, --color-notte,
 * --color-hairline-light, --color-hairline-dark.
 */
export function TopBar(): ReactElement {
  const currentSection = useCurrentSection();
  const prefersReducedMotion = useReducedMotion();
  const { tone: sceneTone } = useSceneTone();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(window.scrollY);

  useEffect(() => {
    let raf = 0;
    const onScroll = (): void => {
      if (raf !== 0) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        const delta = y - lastScrollY.current;
        lastScrollY.current = y;
        if (Math.abs(delta) >= DIRECTION_THRESHOLD_PX) setHidden(delta > 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf !== 0) cancelAnimationFrame(raf);
    };
  }, []);

  const inDark = isNotteSection(currentSection) || sceneTone === 'notte';
  const visible = prefersReducedMotion || !hidden;

  const borderClass = inDark ? 'border-panna/10' : 'border-ink/10';
  const bgClass = inDark ? 'bg-notte/70' : 'bg-carta/70';
  const textClass = inDark ? 'text-panna' : 'text-ink';

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30',
        'border-b backdrop-blur-sm transition-[transform,color,background-color,border-color] duration-[var(--duration-slow)]',
        visible ? 'translate-y-0' : '-translate-y-full',
        borderClass,
        bgClass,
        textClass,
      )}
    >
      <div className="mx-auto flex max-w-page items-center justify-between px-6 py-4">
        <a
          href="#hero"
          className={cn(
            'font-display text-base no-underline transition-colors active:scale-[0.98]',
            textClass,
          )}
        >
          Alessio Brillo
        </a>
        <a
          href="#contact"
          className={cn(
            'font-mono text-xs uppercase tracking-widest no-underline transition-colors active:scale-[0.98]',
            textClass,
          )}
        >
          Contact
        </a>
      </div>
    </header>
  );
}
