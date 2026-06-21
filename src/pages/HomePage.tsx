import type { ReactElement } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { AltitudeGauge } from '@/components/navigation/AltitudeGauge';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/sections/Hero';
import { Who } from '@/sections/Who';
import { Mosaic } from '@/sections/Mosaic';
import { AiPhysics } from '@/sections/AiPhysics';
import { WorkSchool } from '@/sections/WorkSchool';
import { SkySport } from '@/sections/SkySport';
import { Experiences } from '@/sections/Experiences';
import { Contact } from '@/sections/Contact';

/** The single page: one continuous ascent from ground to night. */
export function HomePage(): ReactElement {
  return (
    <>
      <TopBar />
      <AltitudeGauge />
      <main>
        <Hero />
        <Who />
        <Mosaic />
        <AiPhysics />
        <WorkSchool />
        <SkySport />
        <Experiences />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
