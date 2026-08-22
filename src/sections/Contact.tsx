import type { ReactElement } from 'react';
import { Band } from '@/components/ui/Band';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Button } from '@/components/ui/Button';
import { GhostLink } from '@/components/ui/GhostLink';
import { SITE } from '@/lib/site';

/** 07 — One clear invitation. */
export function Contact(): ReactElement {
  return (
    <Band id="contact" ariaLabel="Contact" tone="night">
      <SectionHeader
        eyebrow="SECTOR 07 · LANDING PROTOCOL · 2 CHANNELS"
        title="LANDING PROTOCOL: ESTABLISH COMMUNICATIONS"
        tone="dark"
      />
      <div className="mt-10 flex flex-wrap items-center gap-6">
        <a href={`mailto:${SITE.email}`}>
          <Button>EMAIL ME</Button>
        </a>
        <GhostLink href={SITE.linkedinUrl} target="_blank" rel="noreferrer">
          LINKEDIN
        </GhostLink>
      </div>
    </Band>
  );
}
