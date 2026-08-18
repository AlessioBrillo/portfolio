# ADR-0018: The JavaScript Payload Has a CI-Enforced Budget

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-08-18                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Relates to** | ADR-0001, ADR-0009, ADR-0003 |
| **Supersedes** | N/A                          |
| **Project**    | The Ascent                   |

## Context

ADR-0001 and ADR-0009 committed the project to a performance floor, and the
roadmap's Phase 6 lists performance as a finishing pillar. Until now the only
guard was the `ANALYZE=true` bundle visualizer (`npm run analyze`), an
on-demand HTML report that is never produced by CI. Nothing failed when the
shipped JavaScript grew: a new dependency, an eager import of a heavy
section, a forgotten `import 'lodash'` — all land silently, and the
regression is only noticed when someone happens to run the analyzer.

The tonal engine already code-splits GSAP + ScrollTrigger (`useTonalEngine`
dynamic imports), and every MDX body is a lazy route chunk. The main bundle
still carries React, the router, Framer Motion and all eight bands of the
home page — the payload a visitor's first interaction waits on. The numbers
matter, and they should be enforced, not inspected.

## Decision Drivers

1. **Regression net, not a report.** The gate must run in CI on every build
   and fail the pipeline when the payload grows beyond the committed budget.
2. **Honest measurement.** The gate measures _whole-file_ gzip of the real
   files in `dist/` (what the network actually pays), not per-module gzip
   sums from a bundle analyzer (those overstate the payload — every module
   carries its own gzip header).
3. **Two numbers, both enforced.** The _entry chunk_ (the module script in
   `index.html` — what first interaction waits on) and _total JS_ (every
   chunk summed — the whole-JS cost of the site). A new lazy chunk cannot
   sneak past the total; a growing entry cannot sneak past the entry budget.
4. **Raising a budget is a decision, not a shortcut.** The baseline lives in
   a committed file with its origin documented; raising it is a deliberate
   commit, ideally with an ADR or a measured justification.

## Considered Options

### Option A: `scripts/check-bundle.mjs` reading the real `dist/` (CHOSEN)

`npm run build` already emits `dist/stats.json` (rollup-plugin-visualizer,
raw-data template) for human analysis. The gate instead walks `dist/` itself,
gzips every JS chunk with `node:zlib`, locates the entry chunk via the
`<script type="module">` tag in the built `index.html`, and compares both
numbers against `bundle-baseline.json`. Pure logic lives in
`src/lib/bundle-budget.ts` (unit-tested, 100% covered like the rest of
`src/`); the script is a thin CLI, mirroring the
`scripts/optimize-images.mjs` / `src/lib/photo-pipeline.ts` split.

- Pros: measures exactly what ships; no analyzer-format coupling; works on
  any CI runner; the same command works locally after every build.
- Cons: needs a build before it runs (guaranteed in CI by ordering).

### Option B: Enforce against `dist/stats.json` from the visualizer

- Pros: no new measurement code.
- Cons: the raw-data format is analyzer-internal (keyed by uid, per-module
  `gzipLength`); its gzip sums overstate the real payload by compressing
  every module separately; format churn would silently change the gate.
  Rejected.

### Option C: `size-limit` package

- Pros: batteries included (gzip, budgets in config).
- Cons: one more dependency for what is ~60 lines of pure logic; the repo's
  discipline is minimal deps with local tooling (photo pipeline precedent).
  Rejected.

## Decision

A CI step `npm run bundle:check` runs after `npm run build` in the CI
workflow and fails the pipeline when either budget is exceeded. The budgets
are committed in `bundle-baseline.json` (entry chunk 165 kB, total JS
225 kB gzip — baseline +10%, measured by the gate's own method at commit
3e6e205). `npm run bundle:report` prints the per-chunk breakdown without
failing, for local review.

## Consequences

- The Phase 6 performance pillar now has an executable guard: every PR that
  grows the payload over the budget fails CI until the author either shrinks
  it or deliberately raises the baseline.
- The gate cannot be fooled by content-hash churn: chunk names change every
  build, so the entry chunk is located by basename; the budget is on bytes,
  not names.
- A build without `index.html` or without the committed baseline exits with
  a distinct code (2) — "cannot check" is never reported as "within budget".
- The visualizer stays as the human-facing analysis tool; the gate no longer
  depends on its output format.
- Any future dependency addition that crosses the budget now surfaces in the
  PR where it is introduced, not months later during a Lighthouse run.
