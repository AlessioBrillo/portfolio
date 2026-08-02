import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

const DARK_SECTIONS = new Set(['ai-physics', 'work-school', 'contact']);

/** Minimum scroll delta (px) between ticks before the bar hides/shows. */
const DIRECTION_THRESHOLD_PX = 8;

/**
 * Minimal top bar with tone-aware background and text colour.
 *
 * Uses `useCurrentSection` (IntersectionObserver) to detect the active
 * section and switch between light/dark styling. The `bg-paper/70` fallback
 * provides ~5.4:1 contrast even against night, so text is always AA-legible.
 *
 * Hides on scroll-down and reveals on scroll-up to preserve immersion
 * (ADR-0006); under reduced motion it stays permanently visible (ADR-0009).
 * Movement is a compositor-friendly CSS transform, no animation library.
 */
export function TopBar(): ReactElement {
  const currentSection = useCurrentSection();
  const prefersReducedMotion = useReducedMotion();
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

  const inDark = currentSection ? DARK_SECTIONS.has(currentSection) : false;
  const visible = prefersReducedMotion || !hidden;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30',
        'border-b backdrop-blur-sm transition-[transform,color,background-color,border-color] duration-[var(--duration-slow)]',
        visible ? 'translate-y-0' : '-translate-y-full',
        inDark ? 'border-white/5 bg-night/70 text-cream' : 'border-black/5 bg-paper/70 text-ink',
      )}
    >
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <a
          href="#hero"
          className={cn(
            'font-display text-base no-underline transition-colors',
            inDark ? 'text-cream' : 'text-ink',
          )}
        >
          Alessio Brillo
        </a>
        <a
          href="#contact"
          className={cn(
            'font-mono text-xs uppercase tracking-widest no-underline transition-colors',
            inDark ? 'text-cream' : 'text-ink',
          )}
        >
          Contact
        </a>
      </div>
    </header>
  );
}
