# Case Study Authoring Guide

> Structure reference: [case-study-template.md](case-study-template.md).
> Draft visibility: [ADR-0017](../adr/0017-draft-visibility-noindex.md).

The engineering side of a study is done — the registry, the routes, the E2E
harness, and the content contracts all follow the metadata. What remains for
each new study is authoring. This guide is the author's workflow, end to end.

## The workflow

1. **Write the study.** Start from the authoring template
   (`docs/content/case-study-template.md`) — its header comment carries the
   definition-of-done checklist. To review a study before publishing,
   register it in `CASE_STUDIES` without adding it to `PUBLISHED_ORDER`: the
   route `/{domain}/{slug}` then renders the draft for review by direct URL
   while it stays out of the mosaic, the sitemap, and the navigation
   (ADR-0017).
2. **Update the registry meta.** In
   `src/content/case-studies/registry.ts`, replace the draft's placeholder
   meta (title, role, year, stack, summary) with the real one. `stack` and
   `summary` feed the mosaic tile and the document head, so they must stand
   alone.
3. **Run the content contracts.** `npx vitest run
src/content/case-studies/registry.test.ts` enforces:
   - every registered study carries complete metadata;
   - published bodies carry no author-slot markers (`Author slot`,
     `fill in`, `TBD`, `**—**`) — exact match against `KNOWN_DEBT`;
   - published metadata is production-ready (no `TBD` role, no
     "placeholder" title, 4-digit year, meaningful summary).
4. **Measure the bundle.** `npm run build && npm run bundle:report` — the
   ADR-0018 gate trips on a long body by design. Over budget, either shave the
   study body or re-baseline deliberately (protocol in `docs/roadmap.md`);
   never merge a study that fails `npm run bundle:check`.
5. **Publish.** Move the slug into `PUBLISHED_ORDER` in the registry. The
   deep-link, prev/next, and robots E2E tests are registry-driven
   (`e2e/case-study.e2e.ts`): a published study is covered without editing
   the harness. The build-time sitemap picks it up as well.
6. **Merge.** The usual gates: `npm run typecheck && npm run lint && npm run
format:check && npm test && npm run build`, plus `npm run e2e` when the
   tonal surfaces or any study body changed.

## The known-debt ledger

`KNOWN_DEBT` in `registry.test.ts` records author-slot markers still present
in _published_ bodies (the corpus study's run-log numbers, the ascent study's
unfinished reflection). It is an exact-match ledger:

- a marker **not listed** there fails the contract — nothing new slips in;
- a listed marker that **disappears** also fails — the debt entry must be
  deleted the moment the real content lands.

When the author fills those numbers, the fix is two commits: one removing
the marker from the body, one deleting the debt entry from the test. The
contract then proves the debt is gone.

## House rules

- **English only** in the body, meta, and commit messages.
- **No invented numbers.** A run-log table with `_(fill in)_` is an honest
  draft; a published study with `**—**` is debt.
- **Typography-only bodies.** The MDX map (`mdx-components.tsx`) styles
  standard blocks only — no custom components inside a study body. Diagrams
  are markdown tables or code blocks; photos live in the home-page sections.
- **The registry is the only source of truth.** Never hand-maintain the
  mosaic, the sitemap, or the prev/next order.
