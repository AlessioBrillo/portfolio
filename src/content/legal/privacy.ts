import { LEGAL_UPDATED } from '@/lib/legal';
import type { LegalDocument } from '@/types/legal';

/**
 * The privacy notice for this site, in both languages. It describes what this
 * specific portfolio does — no cookieless template — and takes the rights
 * address as an argument so the single source of truth stays in `lib/legal`.
 */
export function privacyDocuments(email: string): readonly LegalDocument[] {
  return [
    {
      lang: 'it',
      label: 'Italiano',
      title: 'Privacy',
      intro: `Ultimo aggiornamento: ${LEGAL_UPDATED}. Questa informativa descrive il trattamento effettuato da questo sito personale.`,
      note: 'In caso di discrepanza tra le due versioni, prevale la versione italiana.',
      sections: [
        {
          id: 'controller',
          heading: '1. Titolare del trattamento',
          paragraphs: [
            `Il titolare del trattamento è Alessio Brillo. Per esercitare i tuoi diritti o per chiarimenti scrivi a ${email}.`,
          ],
        },
        {
          id: 'data',
          heading: '2. Dati trattati',
          paragraphs: [
            'Questo sito non ha form, account o area riservata. Non imposta cookie e non usa localStorage o sessionStorage. Come qualunque sito statico, riceve però dati tecnici di trasporto: indirizzo IP, User-Agent, URL richiesta, referrer e orario della richiesta.',
            'Per le statistiche di lettura uso Plausible, in modalità senza cookie. Il proxy del sito inoltra a Plausible l’indirizzo IP per il conteggio dei visitatori unici; Plausible lo usa per il calcolo e non lo conserva nei propri log, restituendo solo dati aggregati.',
          ],
        },
        {
          id: 'purposes',
          heading: '3. Finalità e base giuridica',
          paragraphs: [
            'I dati tecnici sono trattati per erogare il sito in modo sicuro e per capire quali contenuti vengono letti. La base giuridica è il legittimo interesse del titolare a mantenere e migliorare un portfolio personale, con impatto minimo perché non ci sono identificatori persistenti, profilazione o tracciamento fra siti.',
          ],
        },
        {
          id: 'recipients',
          heading: '4. Destinatari e trasferimenti',
          paragraphs: [
            'I dati sono trattati da Vercel (hosting e log di esecuzione, Stati Uniti) e da Plausible (analytics, Unione Europea). Entrambi operano come responsabili del trattamento ai sensi di un accordo di livello di servizio dati (DPA); per Vercel si applicano le clausole contrattuali standard o il Data Privacy Framework.',
          ],
          items: [
            'Vercel — https://vercel.com/legal/privacy-policy',
            'Plausible — https://plausible.io/data-policy',
          ],
        },
        {
          id: 'retention',
          heading: '5. Conservazione',
          paragraphs: [
            'I log tecnici di Vercel sono conservati per il tempo previsto dal piano di hosting e poi rimossi automaticamente. Plausible conserva solo dati aggregati secondo la propria policy; l’indirizzo IP non viene memorizzato. Le email inviate per richieste di diritti sono conservate solo per il tempo necessario a rispondere.',
          ],
        },
        {
          id: 'cookies',
          heading: '6. Cookie e servizi di terze parti',
          paragraphs: [
            'Il sito non imposta cookie e non mostra banner. I pulsanti esterni portano a GitHub e LinkedIn: dopo il clic valgono le rispettive informative privacy, che non sono sotto il controllo di questo sito.',
          ],
        },
        {
          id: 'rights',
          heading: '7. I tuoi diritti',
          paragraphs: [
            `Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità e opporti al trattamento scrivendo a ${email}. Puoi anche presentare un reclamo al Garante per la protezione dei dati personali (https://www.garanteprivacy.it). Il sito non adotta decisioni automatizzate con effetti giuridici.`,
          ],
        },
        {
          id: 'changes',
          heading: '8. Modifiche',
          paragraphs: [
            `Questa informativa viene aggiornata quando cambiano hosting, analytics o finalità. La data dell’ultima modifica è ${LEGAL_UPDATED}; le versioni precedenti sono nella cronologia pubblica del repository.`,
          ],
        },
      ],
    },
    {
      lang: 'en',
      label: 'English',
      title: 'Privacy',
      intro: `Last updated: ${LEGAL_UPDATED}. This notice describes the processing carried out by this personal site.`,
      note: 'If the two versions differ, the Italian version prevails.',
      sections: [
        {
          id: 'controller',
          heading: '1. Controller',
          paragraphs: [
            `The controller is Alessio Brillo. To exercise your rights or ask for clarification, write to ${email}.`,
          ],
        },
        {
          id: 'data',
          heading: '2. Data processed',
          paragraphs: [
            'This site has no forms, accounts or members area. It sets no cookies and uses no localStorage or sessionStorage. Like any static site, it still receives transport data: IP address, User-Agent, requested URL, referrer and request time.',
            'Reading statistics use Plausible, without cookies. The site proxy forwards the IP address to Plausible to count unique visitors; Plausible uses it for that calculation and does not keep it in its logs, returning aggregate data only.',
          ],
        },
        {
          id: 'purposes',
          heading: '3. Purposes and legal basis',
          paragraphs: [
            'Transport data is processed to serve the site securely and to understand which content is read. The legal basis is the controller’s legitimate interest in maintaining and improving a personal portfolio, with minimal impact because there are no persistent identifiers, no profiling and no cross-site tracking.',
          ],
        },
        {
          id: 'recipients',
          heading: '4. Recipients and transfers',
          paragraphs: [
            'Data is processed by Vercel (hosting and runtime logs, United States) and Plausible (analytics, European Union), both acting as processors under a data processing agreement. For Vercel, standard contractual clauses or the Data Privacy Framework apply.',
          ],
          items: [
            'Vercel — https://vercel.com/legal/privacy-policy',
            'Plausible — https://plausible.io/data-policy',
          ],
        },
        {
          id: 'retention',
          heading: '5. Retention',
          paragraphs: [
            'Vercel runtime logs are kept for the period set by the hosting plan and then removed automatically. Plausible keeps aggregate data only under its own policy; the IP address is not stored. Emails about rights requests are kept only as long as needed to reply.',
          ],
        },
        {
          id: 'cookies',
          heading: '6. Cookies and third-party services',
          paragraphs: [
            'The site sets no cookies and shows no banner. External buttons lead to GitHub and LinkedIn: once you click, their own privacy notices apply and are outside this site’s control.',
          ],
        },
        {
          id: 'rights',
          heading: '7. Your rights',
          paragraphs: [
            `You can ask for access, rectification, erasure, restriction, portability, or object to the processing by writing to ${email}. You may also complain to the Italian Data Protection Authority (https://www.garanteprivacy.it). The site makes no automated decisions with legal effects.`,
          ],
        },
        {
          id: 'changes',
          heading: '8. Changes',
          paragraphs: [
            `This notice is updated when hosting, analytics or purposes change. The last change is dated ${LEGAL_UPDATED}; earlier versions are in the repository’s public history.`,
          ],
        },
      ],
    },
  ];
}
