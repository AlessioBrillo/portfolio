import type { ReactElement } from 'react';
import { useCurrentSection } from '@/hooks/useCurrentSection';
import { cn } from '@/lib/utils';

const DARK_SECTIONS = new Set(['ai-physics', 'work-school', 'contact']);

/**
 * Minimal top bar with tone-aware background and text colour.
 *
 * Uses `useCurrentSection` (IntersectionObserver) to detect the active
 * section and switch between light/dark styling. The `bg-paper/70` fallback
 * provides ~5.4:1 contrast even against night, so text is always AA-legible.
 *
 * Phase 3 will add "appear on scroll-up / hide on scroll-down" behaviour.
 */
export function TopBar(): ReactElement {
  const currentSection = useCurrentSection();
  const inDark = currentSection ? DARK_SECTIONS.has(currentSection) : false;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-30',
        'border-b backdrop-blur-sm transition-colors duration-[var(--duration-slow)]',
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
