import { LEGAL_UPDATED } from '@/lib/legal';
import type { LegalDocument } from '@/types/legal';

/** Terms, licensing and credits. Italian is the binding version. */
export function legalDocuments(email: string): readonly LegalDocument[] {
  return [
    {
      lang: 'it',
      label: 'Italiano',
      title: 'Note legali',
      intro: `Ultimo aggiornamento: ${LEGAL_UPDATED}. Informazioni su questo sito, sui suoi contenuti e sui crediti.`,
      note: 'In caso di discrepanza tra le due versioni, prevale la versione italiana.',
      sections: [
        {
          id: 'identity',
          heading: '1. Identità e contatti',
          paragraphs: [
            `Sito personale di Alessio Brillo. Per qualsiasi comunicazione: ${email}. La privacy è descritta nella pagina Privacy.`,
          ],
        },
        {
          id: 'nature',
          heading: '2. Natura del sito',
          paragraphs: [
            'Questo sito è un portfolio personale a scopo informativo. Non costituisce un’offerta commerciale, non vende prodotti o servizi e non raccoglie contatti tramite moduli: l’unico pulsante di contatto apre il programma di posta del visitatore.',
          ],
        },
        {
          id: 'copyright',
          heading: '3. Proprietà intellettuale',
          paragraphs: [
            'Il codice sorgente del repository pubblico è distribuito con licenza MIT. Testi, case study, immagini e segni distintivi del sito sono di proprietà dell’autore e sono riservati: non possono essere riprodotti, distribuiti o usati per scopi commerciali senza autorizzazione scritta. Il LICENSE del repository e il file CONTENT-LICENSE definiscono l’ambito delle due licenze.',
          ],
        },
        {
          id: 'links',
          heading: '4. Link esterni',
          paragraphs: [
            'I collegamenti a GitHub e LinkedIn sono forniti per comodità. Non controllo il contenuto di quei siti e non ne rispondo; l’apertura di un link esterno fa applicare le condizioni e le informative del relativo gestore.',
          ],
        },
        {
          id: 'warranty',
          heading: '5. Contenuti tecnici e garanzie',
          paragraphs: [
            'I contenuti sono forniti “così come sono”. Le informazioni tecniche e aeronautiche, comprese le cifre pubblicate negli studi, hanno finalità didattiche e illustrative: non sono istruzioni operative e non devono essere usate per pianificare o eseguire un volo. Per la formazione aeronautica fai riferimento ai manuali ufficiali e a un istruttore abilitato.',
          ],
        },
        {
          id: 'cookies',
          heading: '6. Cookie',
          paragraphs: [
            'Il sito non imposta cookie e non richiede banner. Il trattamento dei dati tecnici è descritto nella pagina Privacy.',
          ],
        },
        {
          id: 'credits',
          heading: '7. Crediti',
          paragraphs: [
            'Tipografia: Archivo, Archivo Black e JetBrains Mono, distribuiti con licenza SIL Open Font License 1.1; i testi delle licenze sono serviti in /fonts/OFL.txt. Hosting e rete: Vercel. Statistiche: Plausible (senza cookie). Le fotografie pubblicate, quando presenti, sono opera dell’autore o accompagnate dalla relativa attribuzione.',
          ],
        },
        {
          id: 'law',
          heading: '8. Legge applicabile',
          paragraphs: [
            'Queste note sono regolate dalla legge italiana. Per eventuali controversie è competente il foro di residenza del titolare, fermo restando il diritto di presentare reclamo al Garante per la protezione dei dati personali.',
          ],
        },
      ],
    },
    {
      lang: 'en',
      label: 'English',
      title: 'Legal',
      intro: `Last updated: ${LEGAL_UPDATED}. Information about this site, its content and its credits.`,
      note: 'If the two versions differ, the Italian version prevails.',
      sections: [
        {
          id: 'identity',
          heading: '1. Identity and contact',
          paragraphs: [
            `Personal site of Alessio Brillo. For any communication: ${email}. Data processing is described on the Privacy page.`,
          ],
        },
        {
          id: 'nature',
          heading: '2. Nature of the site',
          paragraphs: [
            'This is a personal portfolio for information only. It is not a commercial offer, sells no products or services, and collects no contacts through forms: the only contact button opens the visitor’s mail client.',
          ],
        },
        {
          id: 'copyright',
          heading: '3. Intellectual property',
          paragraphs: [
            'The source code of the public repository is distributed under the MIT licence. Text, case studies, images and the site’s branding are the author’s property and all rights are reserved: they may not be reproduced, distributed or used commercially without written permission. The repository LICENSE and the CONTENT-LICENSE file define the scope of the two licences.',
          ],
        },
        {
          id: 'links',
          heading: '4. External links',
          paragraphs: [
            'Links to GitHub and LinkedIn are provided for convenience. I do not control their content and accept no responsibility for it; opening an external link makes the provider’s terms and privacy notices apply.',
          ],
        },
        {
          id: 'warranty',
          heading: '5. Technical content and warranty',
          paragraphs: [
            'Content is provided “as is”. Technical and aviation information, including the figures published in the studies, is for educational and illustrative purposes only: it is not operational instruction and must not be used to plan or execute a flight. Use official manuals and a qualified instructor for aviation training.',
          ],
        },
        {
          id: 'cookies',
          heading: '6. Cookies',
          paragraphs: [
            'The site sets no cookies and needs no banner. The processing of transport data is described on the Privacy page.',
          ],
        },
        {
          id: 'credits',
          heading: '7. Credits',
          paragraphs: [
            'Typography: Archivo, Archivo Black and JetBrains Mono, distributed under the SIL Open Font License 1.1; the licence texts are served at /fonts/OFL.txt. Hosting and network: Vercel. Analytics: Plausible (cookieless). Photographs, when published, are the author’s work or carry their own attribution.',
          ],
        },
        {
          id: 'law',
          heading: '8. Governing law',
          paragraphs: [
            'These notes are governed by Italian law. Any dispute falls under the courts of the controller’s residence, without prejudice to the right to complain to the Italian Data Protection Authority.',
          ],
        },
      ],
    },
  ];
}
