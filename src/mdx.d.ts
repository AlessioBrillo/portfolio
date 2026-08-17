declare module '*.mdx' {
  import type { ComponentType } from 'react';

  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}

declare module '*.mdx?raw' {
  /** The raw MDX source, read by the published-body contract tests. */
  const source: string;
  export default source;
}
