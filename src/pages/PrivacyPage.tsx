import type { ReactElement } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { LegalDocumentView } from '@/components/ui/LegalDocumentView';
import { LegalNav } from '@/components/ui/LegalNav';
import { privacyDocuments } from '@/content/legal/privacy';
import { useDocumentMeta } from '@/hooks/useDocumentMeta';
import { legalRoute, privacyEmail } from '@/lib/legal';
import { canonicalOrigin, SITE } from '@/lib/site';

/** The privacy notice (Italian binding, English courtesy translation). */
export function PrivacyPage(): ReactElement {
  const origin = canonicalOrigin();
  const { title, description } = legalRoute('/privacy');
  useDocumentMeta({
    title,
    description,
    canonical: origin ? `${origin}/privacy` : undefined,
  });

  return (
    <main className="bg-paper text-ink">
      <div className="mx-auto max-w-[760px] px-6 py-[var(--space-section)]">
        <header className="flex flex-col gap-4">
          <Eyebrow>Legal · Privacy</Eyebrow>
          <h1 className="font-display text-[length:var(--text-h2)] font-medium leading-tight text-balance">
            {title}
          </h1>
        </header>
        <div className="mt-12">
          <LegalDocumentView documents={privacyDocuments(privacyEmail(SITE.siteUrl, SITE.email))} />
        </div>
        <LegalNav current="/privacy" />
      </div>
    </main>
  );
}
