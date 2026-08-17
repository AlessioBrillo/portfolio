# ADR-0017: Unpublished Drafts Stay Out of Search — Robots Noindex

## Metadata

| Field          | Value                           |
| -------------- | ------------------------------- |
| **Status**     | Accepted                        |
| **Date**       | 2026-08-17                      |
| **Authors**    | AlessioBrillo                   |
| **Deciders**   | AlessioBrillo                   |
| **Relates to** | ADR-0005, ADR-0015, SECURITY.md |
| **Supersedes** | N/A                             |
| **Project**    | The Ascent                      |

## Context

Case studies are shareable, indexable routes (ADR-0005), and the registry
distinguishes published studies from drafts: an entry in `CASE_STUDIES` that
is not in `PUBLISHED_ORDER` stays out of the mosaic, the sitemap, and the
prev/next navigation, while its route remains resolvable for review
(ADR-0015). `robots.txt` is allow-all by design.

A draft route therefore renders placeholder content ("Author slot — ...",
`role: 'TBD'`) with a canonical link and no search-engine opt-out. Nothing
in the site links to it, but the URL is live on the deployed site: if it is
ever shared — a review link, a comment, an external reference — a crawler
(and a recruiter) can land on a visibly unfinished page. The drafting
workflow was documented, but its search-visibility consequences were not
decided.

## Decision Drivers

1. **Published surfaces are the only surfaces.** The mosaic, the sitemap and
   the nav already exclude drafts; search engines should too — the same
   `PUBLISHED_ORDER` boundary, expressed for crawlers.
2. **The route stays resolvable.** Drafts are reviewed by direct URL
   (ADR-0015's workflow); `noindex` is an instruction to crawlers, not a 404. The review link keeps working.
3. **One boundary, one source of truth.** The publish/draft decision must
   remain the registry's `PUBLISHED_ORDER` — no second hand-maintained list
   in a component.
4. **The head stays honest and clean.** `useDocumentMeta` already owns the
   per-route head; its cleanup must leave no stale nodes behind (the restore
   or remove promise in its docstring).

## Considered Options

### Option A: `noindex` emitted by `useDocumentMeta` for drafts (CHOSEN)

`registry.ts` exports `isPublishedStudy(slug)` (derived from
`PUBLISHED_ORDER`); `CaseStudyPage` passes `robots: 'noindex'` to
`useDocumentMeta` for unpublished slugs, which writes
`<meta name="robots" content="noindex">` and removes or restores it on
unmount like every other head node.

- Pros: one boundary (the registry); draft URLs stay reviewable but never
  indexable; no new infra; the e2e harness pins it in a real browser.
- Cons: a `noindex` page can still be found if a crawler has the URL — it
  just must not surface it. Accepted: that is exactly the drafting intent.

### Option B: Draft routes respond 404/410 until published

- Pros: crawlers and humans both get nothing.
- Cons: breaks the direct-URL review workflow (ADR-0015) — the draft could
  not be previewed on the deployed site; premature for a personal workflow.
  Rejected.

### Option C: `Disallow` draft paths in `robots.txt`

- Pros: zero component code.
- Cons: a second, hand-maintained list of slugs outside the registry; drafts
  would be added here and forgotten; `Disallow` only stops crawling, not
  indexing of already-known URLs. Rejected.

## Decision

The registry exports `isPublishedStudy(slug)` — the same `PUBLISHED_ORDER`
that drives the sitemap and navigation — and `CaseStudyPage` marks
unpublished routes with `robots: 'noindex'` through `useDocumentMeta`. The
hook writes the robots meta like any other head node and restores or removes
it on unmount (fixing the pre-existing leak where created head nodes were
never removed). The e2e harness asserts the directive on the draft route and
its absence on every published deep link.

## Consequences

- A shared draft URL can never become a visible placeholder in search
  results; the review link itself still renders the draft.
- Publishing a study is still a single registry edit (moving the slug into
  `PUBLISHED_ORDER`): the `noindex` disappears automatically.
- `useDocumentMeta`'s cleanup now matches its documented contract for all
  head nodes (description, OG tags, canonical, robots) — covered by unit
  tests.
- The repository's SEO hygiene now has one rule: drafts are out of every
  public surface, including search.
