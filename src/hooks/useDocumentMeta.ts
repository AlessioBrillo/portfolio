import { useEffect } from 'react';

export interface DocumentMeta {
  /** Full page title, e.g. "A transformer on an Italian-language corpus". */
  readonly title: string;
  readonly description?: string;
  readonly canonical?: string;
}

/**
 * Stub for the RED checkpoint: keeps the project type-checking green while the
 * spec fails at runtime. The real implementation follows in the GREEN commit.
 */
export function useDocumentMeta(_meta: DocumentMeta): void {
  useEffect(() => {
    // Intentionally empty — spec under development.
  }, []);
}
