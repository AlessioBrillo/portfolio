import type { ReactElement } from 'react';
import { Band, type Surface } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface SkySportProps {
  surface?: Surface;
}

/** 05 — The adventurous side: aviation/VDS, tennis, MTB. Very visual. */
export function SkySport({ surface = 'solid' }: SkySportProps): ReactElement {
  return (
    <Band id="sky-sport" ariaLabel="Sky and sport" tone="paper" surface={surface}>
      <SectionHeader
        eyebrow="05 — Sky & Sport"
        title="Altitude, on the ground and above it"
        intro="Aviation is also the narrative thread of the whole site — the circle closes here."
      />
    </Band>
  );
}
