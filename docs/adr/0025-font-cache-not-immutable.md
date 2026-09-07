# ADR-0025: Font Binaries Are Not Immutable — Short Cache for `/fonts/*`

## Metadata

| Field          | Value                                                       |
| -------------- | ----------------------------------------------------------- |
| **Status**     | Accepted                                                    |
| **Date**       | 2026-09-07                                                  |
| **Authors**    | AlessioBrillo                                               |
| **Deciders**   | AlessioBrillo                                               |
| **Relates to** | ADR-0007, ADR-0016, ADR-0024, `vercel.json`                 |
| **Supersedes** | N/A (narrows the `immutable` scope ADR-0016 set for photos) |
| **Project**    | The Ascent                                                  |

## Context

`vercel.json` served three routes with `Cache-Control: public,
max-age=31536000, immutable`: `/assets/*`, `/photos/*`, `/fonts/*`.
The first two are correct — Vite content-hashes every `/assets/*` file,
and the photo pipeline embeds a sha-256 prefix in every derivative name
(ADR-0016), so replacing a file always mints new URLs and no cache layer
can serve stale bytes.

The font binaries under `public/fonts/` (`Archivo.woff2`,
`ArchivoBlack.woff2`, `JetBrainsMono.woff2`, plus the `.ttf` sources)
carry stable, unhashed names wired directly into
`src/styles/typography.css` and the `index.html` preloads (ADR-0007).
Re-running the subset script (`npm run fonts:subset`) with new unicode
ranges or a new source version reuses the same URLs with new bytes —
exactly the stale-by-construction shape ADR-0016 removed for photos.
A year-long `immutable` pin would serve stale glyphs at the edge and in
browsers long after a re-subset.

## Decision Drivers

1. No stale glyphs, ever — same standard ADR-0016 set for photos.
2. `immutable` semantics require content-addressed URLs; stable names
   must not carry it.
3. Minimal churn: three small binaries, already edge-cached — the
   revalidation cost of a short cache is negligible.

## Considered Options

### Option A: Short cache for `/fonts/*`, `immutable` stays on hashed routes (CHOSEN)

- Serve `/fonts/(.*)` with `public, max-age=3600,
stale-while-revalidate=86400` — the same bounded policy ADR-0024 chose
  for the proxied third-party script: fresh within the hour, tolerant
  under load.
- `/assets/*` and `/photos/*` keep `immutable` (both content-addressed).

- Pros: one-line header change; stale-proof by construction; no rename
  churn across CSS, HTML preloads, and docs; pinned by the routing
  contract test.
- Cons: fonts revalidate hourly instead of yearly — a few kilobytes per
  visitor per hour, irrelevant at this scale.

### Option B: Content-hash the font filenames, keep `immutable` everywhere

- Pros: uniform `immutable` story across all three routes.
- Cons: renames ripple through `@font-face` declarations, `index.html`
  preloads, the subset script, and `docs/content` font notes — machinery
  for three files that change maybe once a year. Rejected as premature
  machinery (same reasoning ADR-0016 applied against the manifest
  option).

### Option C: Keep `immutable` on `/fonts/*` (status quo)

- Pros: zero change, maximal edge hits.
- Cons: guarantees stale glyphs the day the subset changes under the
  same names; the failure is silent (wrong glyphs, no error). Rejected —
  correctness over hit rate.

## Decision

Adopt **Option A**. `vercel.json` serves `/fonts/(.*)` short-lived;
the `immutable` scope is exactly the content-addressed routes
(`/assets/*`, `/photos/*`). If fonts are ever content-hashed (Option B),
this record is superseded by that ADR — not edited.

## Consequences

- Re-subsetting fonts is safe to deploy: new bytes are live within the
  hour everywhere, no purge step, no rename.
- The routing contract test (`src/lib/deploy-routing.test.ts`) pins both
  halves: `immutable` on the hashed routes, bounded cache and no
  `immutable` on `/fonts/*`.
- Hit-rate cost is negligible (three small binaries, edge-cached hourly).
