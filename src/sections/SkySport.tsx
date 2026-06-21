import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

/** 05 — The adventurous side: aviation/VDS, tennis, MTB. Very visual. */
export function SkySport(): ReactElement {
  return (
    <Band id="sky-sport" ariaLabel="Sky and sport" tone="paper">
      <SectionHeader
        eyebrow="05 — Sky & Sport"
        title="Altitude, on the ground and above it"
        intro="Aviation is also the narrative thread of the whole site — the circle closes here."
      />
    </Band>
  );
}
