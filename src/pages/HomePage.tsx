import { Suspense, lazy, type ReactElement } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { AltitudeGauge } from '@/components/navigation/AltitudeGauge';
import { Footer } from '@/components/ui/Footer';
import { Hero } from '@/sections/Hero';
import { Who } from '@/sections/Who';
import { Mosaic } from '@/sections/Mosaic';
import { WorkSchool } from '@/sections/WorkSchool';
import { SkySport } from '@/sections/SkySport';
import { Experiences } from '@/sections/Experiences';
import { Contact } from '@/sections/Contact';

const TonalScene = lazy(() =>
  import('@/components/ascent/TonalScene').then((m) => ({ default: m.TonalScene })),
);

const AiPhysics = lazy(() =>
  import('@/sections/AiPhysics').then((m) => ({ default: m.AiPhysics })),
);

/**
 * The single page: one continuous flight from ground to night (ADR-0010).
 *
 * A single `TonalScene` backdrop spans the whole flight — it climbs
 * paper -> night into cruise and descends night -> paper through Sky & Sport.
 * Every section over it renders `surface="scene"` so the backdrop shows
 * through; Contact lands on its own solid night outside the scene.
 *
 * The chrome (TopBar, AltitudeGauge) lives *inside* the scene so it can read
 * the live tone published by `TonalScene` (ADR-0011) and follow the blends
 * instead of a static per-section tone.
 *
 * `TonalScene` is lazy-loaded to keep the tonal engine out of the
 * entry chunk. The Suspense fallback paints the paper tone so there is no
 * flash before the engine mounts.
 *
 * `AiPhysics` is lazy-loaded to keep the MDX runtime and syntax highlighting
 * out of the entry chunk — it is the heaviest section.
 */
export function HomePage(): ReactElement {
  return (
    <>
      <main>
        <Suspense fallback={<div aria-hidden className="fixed inset-0 -z-10 bg-paper" />}>
          <TonalScene>
            <TopBar />
            <AltitudeGauge />
            <Hero surface="scene" />
            <Who surface="scene" />
            <Mosaic surface="scene" />
            <Suspense fallback={<div aria-hidden className="h-96 bg-paper/50" />}>
              <AiPhysics surface="scene" />
            </Suspense>
            <WorkSchool surface="scene" />
            <SkySport surface="scene" />
            <Experiences surface="scene" />
          </TonalScene>
        </Suspense>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
