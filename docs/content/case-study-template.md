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

## Publishing vs drafting

Every entry in `CASE_STUDIES` (`src/content/case-studies/registry.ts`) is a
resolvable `/{domain}/{slug}` route, but only the slugs listed in
`PUBLISHED_ORDER` are published:

- **Published** — in `PUBLISHED_ORDER`: rendered as a mosaic tile, listed in
  the sitemap, reachable through prev/next navigation, and covered by the
  registry-driven deep-link E2E tests (`e2e/case-study.e2e.ts`).
- **Draft** — registered in `CASE_STUDIES` only: the route renders for review
  by direct URL, but the study stays out of the mosaic, the sitemap, and the
  navigation until it joins the order.

To start a new study, register a draft in `CASE_STUDIES` (an entry whose key
is absent from `PUBLISHED_ORDER` renders by direct URL as `noindex`, per
ADR-0017), then move the slug into `PUBLISHED_ORDER` when the copy is ready.
The registry content-contract test and the E2E harness follow automatically.
