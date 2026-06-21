# Case Study Template (the "Enlargement")

> Decision record: [ADR-0005](../adr/0005-case-studies-as-mdx-routes.md).

When a tile opens, it must hold long, detailed text without tiring the reader. A
fixed structure, filled differently each time:

1. **Cover** — title (Fraunces) + meta (mono): role, year, stack/domain.
2. **Context** — 2-3 sentences: where you were, why the problem existed.
3. **Problem** — the real, specific knot.
4. **Approach** — how you thought (show the brain, not just the result).
5. **What I built** — technical detail, images, optional snippets/diagrams.
6. **Result / Reflection** — outcome + what you learned. The "growing" part.

## Implementation

Each case study is an `.mdx` file under `src/content/case-studies/`, registered in
`registry.ts` with its `CaseStudyMeta`. The route `/{domain}/{slug}` (e.g.
`/ai/transformer-italian-corpus`) lazy-loads the body and renders it inside the
cover/meta frame in `src/pages/CaseStudyPage.tsx`.

Benefits: **shareable** (send a recruiter a link to _one_ project), indexable, and
the back button returns to the exact scroll position on the home page.

A starter file exists: `src/content/case-studies/transformer-italian-corpus.mdx`.
