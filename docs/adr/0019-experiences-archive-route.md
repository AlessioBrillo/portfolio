# ADR-0019: The Experiences Archive Is a Real Route, Composed from Existing Content

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-08-18                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Relates to** | ADR-0001, ADR-0005, ADR-0017 |
| **Supersedes** | N/A                          |
| **Project**    | The Ascent                   |

## Context

The section brief (`docs/content/sections.md`, band 06) promises: "Curated,
high-impact storytelling on the surface; a 'dig deeper' reveals the
chronological archive." Until now the promise is deferred — the Experiences
band intro literally reads "the archive can come later"
(`src/sections/Experiences.tsx`). Closing Phase 5 requires the archive: it is
the last designed-but-unbuilt structure of the site.

Every record the archive would show already lives in tested content modules:
the published case-study registry (`src/content/case-studies/registry.ts`),
the projects (`src/content/projects.ts`) and the experience stories
(`src/content/experiences.ts`). The archive must reveal that record, not
duplicate it — the repo's discipline is a single source of truth per fact.

## Decision Drivers

1. **Projection, not a data store.** The archive is composed at read time
   from the existing modules. Registering a study, publishing it, or adding a
   project updates the archive with no archive-side edit.
2. **Route, not overlay.** ADR-0005's premise — case studies are shareable,
   indexable URLs — applies to the archive equally: it is a real
   `GET /archive` route with its own document head, not a modal or an anchor
   on the flight.
3. **Reverse-chronological.** Portfolio convention: newest first, undated
   entries last in stable registration order. "Chronological archive" is read
   as the record _of_ time, shown newest-first for a recruiter.
4. **No duplicates.** A project whose `href` already resolves to a published
   study route is represented by the study entry alone; a project without a
   study stands on its own. The rule is self-maintaining: the day a project
   grows into a study, the duplicate disappears without editing the archive.
5. **Published surfaces only.** Draft studies (ADR-0017) never appear; the
   archive emits no `noindex` — it is a published surface.
6. **Paper, outside the flight.** Like every non-home route, the archive is a
   plain paper surface; the tonal flight is the single page's signature and
   stays there (ADR-0001).

## Considered Options

### Option A: one `/archive` route, composed from content (CHOSEN)

`src/content/archive.ts` projects studies + projects + experiences into a
typed `ArchiveEntry` list, reverse-chronological, with the dedupe rule above.
`src/pages/ArchivePage.tsx` renders it as a paper route with
`useDocumentMeta` head. `/archive` joins the sitemap entries.

- Pros: one URL, one list, zero duplication, registry-driven, trivially
  tested; the mosaic and prev/next logic are untouched.
- Cons: none material — the page is small enough to ship eagerly.

### Option B: per-domain archives (`/ai/archive`, `/work/archive`, ...)

- Pros: mirrors the `/{domain}/{slug}` shape.
- Cons: three sparse archives for content that fits one list; more routes,
  more navigation surface, and the chronological whole — the point of the
  archive — is split. Rejected.

### Option C: an anchor section on the single page

- Pros: no new route.
- Cons: the archive is "dig deeper" by design — it would grow the flight the
  signature depends on and blur the surface/archive distinction the brief
  draws. Rejected.

## Decision

Add the `/archive` route before the catch-all. Content comes from a new pure
module `src/content/archive.ts` composing the published registry, projects
and experiences; projects already covered by a published study are skipped.
Entries sort newest-first by year, undated last (stable). The page renders on
paper outside `TonalScene`, owns its head via `useDocumentMeta` (canonical
only when `VITE_SITE_URL` is configured, per the pre-domain policy in
`src/lib/site.ts`), and links back to the flight. `/archive` is added to the
postbuild sitemap entries. The Experiences band gains a "Dig deeper" link.

## Consequences

- The archive is always truthful: publishing a study or editing a project
  changes it without touching it.
- The sitemap gains `/archive` (still skipped entirely pre-domain).
- The `e2e/` harness gains a registry-adjacent deep-link spec; the route
  change triggers the E2E workflow (its filter already includes
  `src/router.tsx` and `src/pages/**`).
- The bundle budget (ADR-0018) is the regression net for the page's eager
  import; if it trips, the baseline is re-measured with its documented
  origin note — never raised silently.
- The band 06 intro copy ("the archive can come later") is retired.
