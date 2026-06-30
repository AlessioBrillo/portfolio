import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { GhostLink } from '@/components/ui/GhostLink';

/** 07 — One clear invitation. */
export function Contact(): ReactElement {
  return (
    <Band id="contact" ariaLabel="Contact" tone="night">
      <SectionHeader eyebrow="07 — Contact" title="Let's talk." />
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <a href="mailto:alessio@ilcassero.it">
          <Button>Email me</Button>
        </a>
        <GhostLink
          href="https://www.linkedin.com/in/alessio-brillo"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </GhostLink>
      </div>
    </Band>
  );
}
