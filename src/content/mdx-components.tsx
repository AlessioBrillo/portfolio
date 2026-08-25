import type { ComponentProps, ReactElement } from 'react';

/**
 * Maps the HTML blocks an MDX case study body can produce onto the design
 * system. Tailwind's preflight neutralises native heading styles, so without
 * this map the long-form body would render typographically flat — Phase 4's
 * missing half (see docs/content/case-study-template.md).
 *
 * Discipline: typography only — the cover/meta frame is the page's job, this
 * map never introduces decoration beyond the site's own accents.
 *
 * Typing note: `MDXComponents` from `mdx/types.js` resolves members to `never`
 * under React 19 (the global `JSX` namespace it keys off no longer exists and
 * `skipLibCheck` hides the error), so the map is typed structurally here and
 * adapted at the `MDXProvider` boundary in `App.tsx`.
 */

type MdxBlockTag =
  | 'h2'
  | 'h3'
  | 'p'
  | 'a'
  | 'ul'
  | 'ol'
  | 'li'
  | 'strong'
  | 'em'
  | 'code'
  | 'pre'
  | 'blockquote'
  | 'hr'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'th'
  | 'td';

export type MdxComponentMap = Readonly<{
  [Tag in MdxBlockTag]: (props: ComponentProps<Tag>) => ReactElement;
}>;

function H2(props: ComponentProps<'h2'>): ReactElement {
  return (
    <h2
      className="mt-10 scroll-mt-16 font-display text-[length:var(--text-h2)] font-medium leading-[1.1] text-balance first:mt-0"
      {...props}
    />
  );
}

function H3(props: ComponentProps<'h3'>): ReactElement {
  return (
    <h3
      className="mt-4 font-display text-[length:var(--text-h3)] font-medium leading-snug first:mt-0"
      {...props}
    />
  );
}

function Paragraph(props: ComponentProps<'p'>): ReactElement {
  return <p className="leading-relaxed text-pretty" {...props} />;
}

function Link(props: ComponentProps<'a'>): ReactElement {
  return (
    <a
      className="font-medium text-accent underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent/80"
      {...props}
    />
  );
}

function UnorderedList(props: ComponentProps<'ul'>): ReactElement {
  return <ul className="list-disc space-y-2 pl-6 marker:text-accent" {...props} />;
}

function OrderedList(props: ComponentProps<'ol'>): ReactElement {
  return <ol className="list-decimal space-y-2 pl-6 marker:text-accent" {...props} />;
}

function ListItem(props: ComponentProps<'li'>): ReactElement {
  return <li className="leading-relaxed" {...props} />;
}

function Strong(props: ComponentProps<'strong'>): ReactElement {
  return <strong className="font-semibold" {...props} />;
}

function Emphasis(props: ComponentProps<'em'>): ReactElement {
  return <em className="italic" {...props} />;
}

function InlineCode(props: ComponentProps<'code'>): ReactElement {
  return (
    <code
      className="rounded-none bg-night/50 px-1.5 py-0.5 font-mono text-[0.875em] text-phosphor"
      {...props}
    />
  );
}

function Preformatted(props: ComponentProps<'pre'>): ReactElement {
  return (
    <pre
      className="overflow-x-auto rounded-none bg-night px-5 py-4 font-mono text-sm leading-relaxed text-phosphor [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    />
  );
}

function Blockquote(props: ComponentProps<'blockquote'>): ReactElement {
  return (
    <blockquote
      className="border-l-[var(--hairline-thick)] border-accent pl-5 italic text-ink"
      {...props}
    />
  );
}

function Hr(props: ComponentProps<'hr'>): ReactElement {
  return <hr className="my-2 border-t border-ink/10" {...props} />;
}

/**
 * Run-log tables get a card frame with horizontal scrolling on narrow
 * viewports — the same figure treatment as the night `pre` blocks, on the
 * paper surface. Row hairlines live on `tr`/`th` so the grid reads as a
 * single object even when it scrolls.
 */
function Table(props: ComponentProps<'table'>): ReactElement {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-card)] border border-ink/10">
      <table
        className="w-full border-collapse text-left text-[length:var(--text-body)]"
        {...props}
      />
    </div>
  );
}

function TableHead(props: ComponentProps<'thead'>): ReactElement {
  return <thead {...props} />;
}

function TableBody(props: ComponentProps<'tbody'>): ReactElement {
  return <tbody {...props} />;
}

function TableRow(props: ComponentProps<'tr'>): ReactElement {
  return <tr className="border-b border-ink/10 last:border-b-0" {...props} />;
}

function TableHeaderCell(props: ComponentProps<'th'>): ReactElement {
  return (
    <th
      className="border-b border-ink/10 px-4 py-2.5 font-mono text-xs font-medium uppercase tracking-widest text-ink-soft"
      {...props}
    />
  );
}

function TableCell(props: ComponentProps<'td'>): ReactElement {
  return <td className="px-4 py-2.5 align-top" {...props} />;
}

/** The component map consumed by the app-level `MDXProvider`. */
export const mdxComponents: MdxComponentMap = {
  h2: H2,
  h3: H3,
  p: Paragraph,
  a: Link,
  ul: UnorderedList,
  ol: OrderedList,
  li: ListItem,
  strong: Strong,
  em: Emphasis,
  code: InlineCode,
  pre: Preformatted,
  blockquote: Blockquote,
  hr: Hr,
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeaderCell,
  td: TableCell,
};
