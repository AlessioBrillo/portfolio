import { useCallback, useEffect, useRef, useState } from 'react';

function getScrollProgress(): number {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  return scrollable > 0 ? window.scrollY / scrollable : 0;
}

export function useScrollProgress(): number {
  const [progress, setProgress] = useState(getScrollProgress);
  const rafRef = useRef<number>(0);

  const update = useCallback(() => {
    setProgress(getScrollProgress());
    rafRef.current = 0;
  }, []);

  const handleScroll = useCallback(() => {
    if (rafRef.current === 0) {
      rafRef.current = requestAnimationFrame(update);
    }
  }, [update]);

  useEffect(() => {
    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current !== 0) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll, update]);

  return progress;
}
