import { useEffect, useState } from 'react';

/**
 * Returns vertical scroll progress through the document as a value in [0, 1].
 * Used by the altitude gauge to reflect how much quota has been gained.
 *
 * NOTE: this is a lightweight baseline. The GSAP ScrollTrigger engine that
 * drives the tonal band transitions is intentionally out of scope for the
 * scaffold (see ADR-0003 and docs/roadmap.md).
 */
export function useScrollProgress(): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = (): void => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? window.scrollY / scrollable : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return progress;
}
