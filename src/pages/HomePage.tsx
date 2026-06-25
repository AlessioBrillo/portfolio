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
 * A single `TonalScene` backdrop spans the whole flight — it climbs
 * paper -> night into cruise and descends night -> paper through Sky & Sport.
 * Every section over it renders `surface="scene"` so the backdrop shows
 * through; Contact lands on its own solid night outside the scene.
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
          <WorkSchool surface="scene" />
          <SkySport surface="scene" />
          <Experiences surface="scene" />
        </TonalScene>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
