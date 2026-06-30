import { useEffect, useState } from 'react';
import type { SectionId } from '@/types/domain';
import { SECTION_ORDER } from '@/lib/altitude';

/**
 * Tracks which section occupies the most viewport real estate via
 * IntersectionObserver. Returns the SectionId with the largest intersection
 * ratio, or `null` before the first observation.
 *
 * Used by the AltitudeGauge (Phase 3) and TopBar to determine tonal context.
 */
export function useCurrentSection(): SectionId | null {
  const [active, setActive] = useState<SectionId | null>(null);

  useEffect(() => {
    const ratios = new Map<SectionId, number>();
    let rafPending = false;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id as SectionId;
          if (SECTION_ORDER.includes(id)) {
            ratios.set(id, entry.intersectionRatio);
          }
        }

        if (!rafPending) {
          rafPending = true;
          requestAnimationFrame(() => {
            rafPending = false;
            const max = SECTION_ORDER.reduce<{ id: SectionId | null; ratio: number }>(
              (best, id) => {
                const r = ratios.get(id) ?? 0;
                return r > best.ratio ? { id, ratio: r } : best;
              },
              { id: null, ratio: 0 },
            );
            setActive(max.id);
          });
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] },
    );

    const elements: Element[] = [];
    for (const id of SECTION_ORDER) {
      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      for (const el of elements) observer.unobserve(el);
      observer.disconnect();
    };
  }, []);

  return active;
}
