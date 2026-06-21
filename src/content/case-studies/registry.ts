import type { ComponentType } from 'react';
import type { CaseStudyMeta } from '@/types/domain';

interface CaseStudyEntry {
  readonly meta: CaseStudyMeta;
  /** Lazy loader for the MDX body, code-split per case study. */
  readonly load: () => Promise<{ default: ComponentType }>;
}

/**
 * The single source of truth for published case studies. Add an entry here and
 * drop a sibling `.mdx` file; the `/{domain}/{slug}` route renders it (ADR-0005).
 */
export const CASE_STUDIES: Readonly<Record<string, CaseStudyEntry>> = {
  'transformer-italian-corpus': {
    meta: {
      slug: 'transformer-italian-corpus',
      domain: 'ai',
      title: 'A transformer on an Italian-language corpus',
      role: 'Independent project',
      year: '2025',
      stack: ['PyTorch', 'Tokenizers', 'Python'],
      summary: 'Training a small transformer from scratch on Italian text.',
    },
    load: () => import('./transformer-italian-corpus.mdx'),
  },
};

export function getCaseStudy(slug: string): CaseStudyEntry | undefined {
  return CASE_STUDIES[slug];
}
