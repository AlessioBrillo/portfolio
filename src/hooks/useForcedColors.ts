import { useEffect, useState } from 'react';

const QUERY = '(forced-colors: active)';

/**
 * Tracks the user's forced-colors preference reactively (Windows High Contrast mode).
 * Texture layers (grain, scanlines, constellation) must opt out when true.
 */
export function useForcedColors(): boolean {
  const [prefersForcedColors, setPrefersForcedColors] = useState<boolean>(
    () =>
      /* v8 ignore start -- SSR-only branch: this SPA always renders in a browser. */
      typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
    /* v8 ignore stop */
  );

  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = (): void => setPrefersForcedColors(media.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return prefersForcedColors;
}
