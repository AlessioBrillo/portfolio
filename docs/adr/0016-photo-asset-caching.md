# ADR-0016: Content-Hashed Photo Assets with Immutable Caching

## Metadata

| Field          | Value                           |
| -------------- | ------------------------------- |
| **Status**     | Accepted                        |
| **Date**       | 2026-08-16                      |
| **Authors**    | AlessioBrillo                   |
| **Deciders**   | AlessioBrillo                   |
| **Relates to** | ADR-0009, ADR-0005, vercel.json |
| **Supersedes** | N/A                             |
| **Project**    | The Ascent                      |

## Context

The photo pipeline (`scripts/optimize-images.mjs`, PR #87) writes derivatives
under **stable, unhashed filenames** (`vds-volo-01-1600.avif`). Replacing a raw
photo and re-running the script produces the **same URLs with new bytes** —
and the Vercel caching headers only mark `/assets/*` as immutable, not
`/photos/*`. The result is a guarantee of stale photos on CDN and browser
caches the day the author's real photos land (roadmap Phase 5, input 1), plus
a `docs/content/photos.md` claim ("cache-safe thanks to the immutable asset
headers") that was false for the photo route.

## Decision Drivers

1. **No stale photos, ever.** The author's workflow is "drop a new raw in,
   re-run, replace the block": the delivered URLs must change when the bytes
   change, so no cache layer can serve the old photo.
2. **Cacheability is the default, not a manual step.** The immutable
   `Cache-Control` already used for hashed JS/CSS must extend to photos without
   any per-photo maintenance.
3. **The pipeline stays the single writer** (ADR-0009's zero-CLS promise holds
   because content modules paste script-printed values): naming must remain
   fully derived from the raw file, with no hand-edited fields.
4. **The 80% coverage floor applies** (repo convention): the naming and pruning
   logic must be pure, testable helpers, not inline script code.

## Considered Options

### Option A: Content-hashed filenames + immutable `/photos/*` caching (CHOSEN)

Every derivative embeds the first 8 hex chars of the source's sha-256:
`{subject}-{width}-{hash}.{ext}` (e.g. `vds-volo-01-1600-a1b2c3d4.avif`).
`vercel.json` serves `/photos/(.*)` with `Cache-Control: public,
max-age=31536000, immutable`. `--prune` removes derivatives the run did not
produce (including legacy unhashed names).

- Pros: replacing a raw changes every URL — stale content is impossible by
  construction; immutable caching becomes correct; idempotent re-runs (same
  raw, same names); prune keeps the committed set honest; the helpers live in
  `src/lib/photo-pipeline.ts`, unit-tested under the coverage floor.
- Cons: URLs are less human-readable; an 8-hex (32-bit) hash is collision-safe
  for a personal site's photo count, not a general content-addressable store —
  accepted, and the collision check in the script guards slug collisions
  (the real risk).

### Option B: Stable names + cache-busting query parameter (`?v=hash`)

- Pros: filenames stay pretty.
- Cons: `?v=` URLs defeat `immutable` caching semantics, leak version state
  into content modules, and are easy to forget when pasting blocks; the CDN
  keying is still per-path so old variants linger. Rejected.

### Option C: Stable names, no caching for `/photos/*`

- Pros: never stale.
- Cons: every visit re-downloads the full responsive set (AVIF+WebP+JPEG per
  photo); the site's photos are its protagonists — this trades bandwidth for
  nothing. Rejected.

### Option D: Content-hash in a manifest, names mapped at build time

- Pros: pretty URLs in content modules.
- Cons: a second moving part (manifest generation, mapping resolution) for
  zero benefit at this scale; the content modules are the manifest. Rejected
  as premature machinery.

## Decision

The pipeline derives every filename from the source bytes: sha-256 of the raw
file, trimmed to 8 hex chars, embedded as `{subject}-{width}-{hash}.{ext}`
(helpers in `src/lib/photo-pipeline.ts`, pure and unit-tested). The script
fails fast on slug collisions, supports `--prune` for stale derivatives
(hashed and legacy), and refuses `--out` equal to `--src`. `vercel.json`
serves `/photos/(.*)` with `max-age=31536000, immutable`, matching the
`/assets/*` treatment.

## Consequences

- Replacing a photo = new hash = new URLs = correct stale-proof delivery; the
  printed `ImageAsset` block always carries current URLs.
- `docs/content/photos.md` and `public/photos/README.md` document the hashed
  convention, the `--prune` workflow and the Node >=22.18 requirement.
- Legacy unhashed derivatives are pruned explicitly (`--prune`) — never
  automatically — so the migration is a conscious act.
- Hash collisions within one subject's set remain astronomically unlikely
  (32 bits) and would only resurface on an identical-URL replacement, which
  the immutable cache would then serve — accepted for a personal site; a
  longer hash is a one-line change in `HASH_LENGTH` if ever needed.
