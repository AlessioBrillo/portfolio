# ADR-0005: Case Studies as MDX with Shareable `/{domain}/{slug}` Routes

## Metadata

| Field          | Value              |
| -------------- | ------------------ |
| **Status**     | Accepted           |
| **Date**       | 2026-06-21         |
| **Authors**    | AlessioBrillo      |
| **Deciders**   | AlessioBrillo      |
| **Supersedes** | N/A                |
| **Relates to** | ADR-0001, ADR-0002 |
| **Project**    | The Ascent         |

## Context

Each mosaic tile is a curated teaser on the surface; digging opens a long,
detailed case study. Those studies hold substantial prose, images, and
occasionally diagrams or snippets. They must be easy to author, shareable with a
single recruiter, and indexable.

## Decision Drivers

1. **Long-form authoring** — markdown comfort with the option of embedded
   components.
2. **Shareability** — a recruiter should receive a link to _one_ project.
3. **Indexability** — real URLs, not modal overlays.
4. **Return-to-context** — back navigation lands where the reader left off.

## Considered Options

### Option A: MDX bodies on dedicated routes `/{domain}/{slug}` (CHOSEN)

e.g. `/ai/transformer-italian-corpus`. Each study is a code-split MDX module
loaded by a registry.

### Option B: In-page expanding overlays (no routes)

Rejected: not shareable or indexable; back-button semantics are awkward.

### Option C: A headless CMS

Rejected: overkill for a personal portfolio; adds a service dependency and cost
for content that lives happily in the repo.

## Decision

Author case studies as `.mdx` files under `src/content/case-studies/`, registered
in `registry.ts` with their metadata. The route `/:domain/:slug` resolves the
slug, lazy-loads the MDX body, and renders it inside a fixed case-study template
(`docs/content/case-study-template.md`).

## Consequences

- **Positive:** friendly authoring, shareable/indexable URLs, per-study code
  splitting.
- **Negative:** client-side routing needs host rewrite config (SPA fallback) for
  deep links — documented for the deploy step.
