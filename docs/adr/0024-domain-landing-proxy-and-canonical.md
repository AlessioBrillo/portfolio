# ADR-0024: Domain Landing — Proxy Mechanism, Script Cache, and Canonical

## Metadata

| Field          | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| **Status**     | Accepted                                                     |
| **Date**       | 2026-09-06                                                   |
| **Authors**    | AlessioBrillo                                                |
| **Deciders**   | AlessioBrillo                                                |
| **Supersedes** | ADR-0020 (proxy mechanism only)                              |
| **Relates to** | ADR-0013, ADR-0018, ADR-0020, `vercel.json`, `middleware.ts` |
| **Project**    | The Ascent                                                   |

## Context

ADR-0020 staged the Plausible proxy as two static Vercel rewrites in
`vercel.json`, activated by the `VITE_PLAUSIBLE_SRC` +
`VITE_PLAUSIBLE_DOMAIN` env pair. The implementation has since moved to an
Edge Middleware (`middleware.ts`, declared in `vercel.json` under
`functions.middleware.ts`): the rewrites never shipped, and ADR-0020 now
describes infrastructure that does not exist. Anyone operating the
domain landing from the ADR alone would look for routing surgery that is no
longer needed — the activation really is env-var-only plus a rebuild.

Two further findings from the pre-domain review:

1. The proxied script was served with `Cache-Control: public,
max-age=31536000, immutable` — the correct policy for our own
   content-hashed assets (`/assets/*`, `/photos/*`, ADR-0016) but wrong for
   a third-party body served under our origin: an upstream Plausible rotation
   under the same URL would stay stale at the edge for up to a year.
2. The `VITE_SITE_URL`-set path (sitemap, absolute og:image, JSON-LD `url`,
   robots `Sitemap:` line) was never exercised in CI — the main job builds
   with the env unset, so the whole domain-mode postbuild was verified only
   by hand at deploy time.

The canonical host (apex vs `www`) was also undecided, while the runbook
explicitly deferred the redirect choice.

## Decision Drivers

1. The ADR record must describe the mechanism that actually ships.
2. A proxied third-party script must track upstream within hours, not years.
3. The domain-mode build must be green in CI before the domain exists.
4. One canonical host; no duplicate apex + `www` content both returning 200.

## Considered Options

### Option A: Edge Middleware + short script cache + apex canonical (CHOSEN)

- Keep `middleware.ts` as the proxy mechanism; ADR-0020's rewrite note is
  superseded, its env-pair activation contract is unchanged.
- Script cache: `public, max-age=3600, stale-while-revalidate=86400`, never
  `immutable`. The beacon stays `no-store`.
- Canonical host is the apex (`https://<domain>`); `www` redirects to it at
  the Vercel level. `VITE_SITE_URL` carries the apex only.
- A `domain-dry-run` CI job builds with `VITE_SITE_URL=https://example.com`
  and fails closed on any missing domain-mode artifact (7 sitemap URLs,
  absolute og:image, JSON-LD `url`, robots `Sitemap:` line).

- Pros: ADRs match the code; script tracks upstream within an hour while
  staying edge-cached; the deploy day changes an origin string, not a
  mechanism; no duplicate-content SEO surface.
- Cons: `stale-while-revalidate` still serves up to a day of stale script
  under load — accepted, bounded, and documented here.

### Option B: Restore static rewrites as ADR-0020 described

- Pros: literal ADR compliance.
- Cons: rewrites cannot answer 404-as-JS-guard, cannot enforce the
  same-origin beacon check, and cannot set per-route cache/CSP headers —
  all behaviour the middleware currently pins with unit tests
  (`src/middleware.test.ts`). Rejected — it trades tested behaviour for
  documentary tidiness.

### Option C: Immutable script cache with manual purge on rotation

- Pros: maximal edge hits.
- Cons: purge is a human step on someone else's release schedule; a missed
  rotation ships stale analytics code silently for months. Rejected — the
  hit-rate gain (~1 KB script, already edge-cached for an hour) does not pay
  for the operational tail.

## Decision

Adopt **Option A**.

1. **Mechanism**: `middleware.ts` is the proxy; ADR-0020's rewrite passage is
   superseded. The env-pair activation contract (ADR-0013) is unchanged, with
   one operational addendum: after changing any `VITE_*` var in Vercel,
   **rebuild/redeploy** — the client bakes the pair at build time while the
   middleware reads it at request time, so an env-only change without a
   rebuild desyncs the two sides.
2. **Script cache**: `public, max-age=3600, stale-while-revalidate=86400`;
   no `immutable` on any proxied third-party body. Pinned by
   `src/middleware.test.ts` and `e2e/analytics.e2e.ts`.
3. **Beacon relay risk (accepted)**: `/api/event` has no per-IP rate limit;
   the same-origin `Origin` guard is spoofable by non-browser senders, so a
   determined caller can burn Plausible quota through our origin. Accepted at
   this traffic scale — anomalous ingestion is visible in the Plausible
   dashboard — revisit with edge rate limiting if ingestion ever diverges
   from real visits.
4. **Canonical**: apex is canonical; `www` 301-redirects to the apex;
   `VITE_SITE_URL=https://<domain>` (no trailing slash). Unknown study
   domains (`/:domain/:slug` outside `ai | work | sky`) and the catch-all
   render `noindex`, since the SPA fallback serves them as HTTP 200 —
   the meta tag is the only thing keeping soft-404s out of the index.
5. **Bundle policy on the next trip**: when the ADR-0018 gate trips,
   shave first (code-split a band, inline heavy tables); raise the budget
   only as a measured, noted regression. An unexplained bump stays forbidden.

## Consequences

- The runbook's deploy day is env-var-only plus the `www`→apex redirect —
  no routing changes, no code changes.
- The `domain-dry-run` CI job covers the mechanism today; the production
  deploy changes only the origin string.
- ADR-0013 (env-gated analytics) and ADR-0018 (bundle budget) are
  reaffirmed, not superseded. ADR-0020's activation contract stands; only
  its mechanism passage is superseded by this record.
