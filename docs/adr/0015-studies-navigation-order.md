# ADR-0015: Cross-Study Navigation in a Curated Reading Order

## Metadata

| Field          | Value              |
| -------------- | ------------------ |
| **Status**     | Accepted           |
| **Date**       | 2026-08-13         |
| **Authors**    | AlessioBrillo      |
| **Deciders**   | AlessioBrillo      |
| **Relates to** | ADR-0005, ADR-0009 |
| **Supersedes** | N/A                |
| **Project**    | The Ascent         |

## Context

Case studies are shareable routes (ADR-0005), and the mosaic index curates them
as teasers. A reader who reaches a study's end needs a path onward — and the
natural affordance is a prev/next pair. The question is which order the pair
follows: the studies span three domains (`ai`, `work`, `sky`), and a per-domain
ordering would produce a different sequence than the mosaic's narrative.

The build-time sitemap already depends on a curated order
(`PUBLISHED_ORDER` in `src/content/case-studies/registry.ts`); a second,
independent order for on-page navigation would let the two drift apart.

## Decision Drivers

1. **One order, one source of truth.** The mosaic's narrative, the prev/next
   navigation, and the sitemap must all read the same curated sequence — never
   two hand-maintained lists.
2. **The journey is the theme** (ADR-0001, ADR-0008): the reading order is a
   flight, not a filing system. Cross-domain hops (AI work -> engineering
   showcase -> sky) are deliberate storytelling, not a routing accident.
3. **AA and keyboard access remain floors** (ADR-0009, WCAG 2.4.3): navigating
   between studies must not strand focus on a removed element.

## Considered Options

### Option A: Global curated order, shared with the sitemap (CHOSEN)

`studyNavigation(slug)` walks `getPublishedCaseStudies()` — the same
`PUBLISHED_ORDER` that drives `scripts/generate-sitemap.mjs` — and yields the
neighbours in that sequence. The nav is rendered only when a neighbour exists
(first study has no Previous, last has no Next), keeping the links truthful.

- Pros: a single order definition; the mosaic narrative and the sitemap can
  never disagree; minimal code (no new registry surface).
- Cons: prev/next can cross domains (ai -> work, work -> sky) — accepted, since
  the hop is the narrative.

### Option B: Per-domain prev/next

Neighbours are resolved within `meta.domain`, keeping the reader inside one
domain until it ends.

- Pros: domain-consistent browsing for readers who care about one topic.
- Cons: a second ordering rule to maintain and document; the curated narrative
  (and the sitemap) would disagree with what the nav shows; most domains hold
  a single study today, so the nav would almost never render. Rejected as
  premature structure for the current content set.

### Option C: No prev/next (back to the mosaic only)

- Pros: zero new surface.
- Cons: dead-ends the reader after the closing paragraph; the mosaic is a
  teaser, not a reading path. Rejected.

## Decision

The case-study template renders a two-column prev/next block (Previous study /
Next study) in the **global curated order** defined by `PUBLISHED_ORDER` in
`src/content/case-studies/registry.ts` — the same order the build-time sitemap
uses. The block is omitted entirely on studies without neighbours, so no empty
links are ever rendered. On slug change, focus moves to the study heading
(`tabIndex={-1}`), never on the initial deep-link load.

## Consequences

- Adding a study to `CASE_STUDIES` alone does not change navigation or the
  sitemap: it must also be added to `PUBLISHED_ORDER` — one edit, two consumers.
- The e2e harness pins the cross-domain hop (ai -> work) so a future reordering
  is a conscious decision, not a silent change.
- Focus management follows the site's a11y floor; the heading is the announced
  landmark after a client-side hop, and deep links keep their natural focus.
