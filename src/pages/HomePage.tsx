import type { ReactElement } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { AltitudeGauge } from '@/components/navigation/AltitudeGauge';
import { TonalScene } from '@/components/ascent/TonalScene';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/sections/Hero';
import { Who } from '@/sections/Who';
import { Mosaic } from '@/sections/Mosaic';
import { AiPhysics } from '@/sections/AiPhysics';
import { WorkSchool } from '@/sections/WorkSchool';
import { SkySport } from '@/sections/SkySport';
import { Experiences } from '@/sections/Experiences';
import { Contact } from '@/sections/Contact';

/**
 * The single page: one continuous flight from ground to night (ADR-0010).
 *
 * Phase 2 ships the *first* tonal transition: the ground -> cruise group is
 * wrapped in a `TonalScene` whose backdrop crossfades paper -> night on scroll.
 * Those four sections render `surface="scene"` so the backdrop shows through.
 * The remaining bands stay solid until the full flight engine lands in Phase 3.
 */
export function HomePage(): ReactElement {
  return (
    <>
      <TopBar />
      <AltitudeGauge />
      <main>
        <TonalScene>
          <Hero surface="scene" />
          <Who surface="scene" />
          <Mosaic surface="scene" />
          <AiPhysics surface="scene" />
        </TonalScene>
        <WorkSchool />
        <SkySport />
        <Experiences />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
