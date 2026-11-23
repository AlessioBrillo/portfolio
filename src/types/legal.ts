/** Language variants of a published legal document. */
export type LegalLang = 'it' | 'en';

/** A numbered section of a legal document. `id` is a stable anchor suffix. */
export interface LegalSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly items?: readonly string[];
}

/**
 * One language of a legal document. Both languages live on the same route;
 * the Italian document is the binding one, the English one is a courtesy
 * translation.
 */
export interface LegalDocument {
  readonly lang: LegalLang;
  readonly label: string;
  readonly title: string;
  readonly intro: string;
  readonly note?: string;
  readonly sections: readonly LegalSection[];
}
