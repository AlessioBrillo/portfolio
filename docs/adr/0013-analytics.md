# ADR-0013: Privacy-First Analytics, Env-Gated (Plausible)

## Metadata

| Field          | Value                                                      |
| -------------- | ---------------------------------------------------------- |
| **Status**     | Accepted                                                   |
| **Date**       | 2026-08-13                                                 |
| **Authors**    | AlessioBrillo                                              |
| **Deciders**   | AlessioBrillo                                              |
| **Relates to** | ADR-0009 (performance floor), SECURITY.md, vercel.json CSP |
| **Supersedes** | Roadmap Phase 7's open "analytics" line item               |
| **Project**    | The Ascent                                                 |

## Context

The portfolio is a product, but it has no telemetry: the author cannot see
whether recruiters read case studies, where they drop off, or which bands
convert. The roadmap parked analytics in Phase 7 ("After"); the deploy layer
(the domain) is still pending, which previously blocked any meaningful data.

The constraints at play:

1. **The page must stay third-party-free until the real domain exists** — the
   interim vercel.app deployment should not send beacons anywhere.
2. **The strict CSP** added to `vercel.json` (ADR-0009's hardening) must not
   be loosened to accommodate analytics.
3. **GDPR posture**: the site is visited from the EU. Cookie-based, ad-tech
   analytics would require a consent banner — a dissonant, design-breaking
   addition (ADR-0004's spirit: no UI chrome for things that should not
   exist).
4. **Zero maintenance surface**: a single script, no SDK, no config drift.

## Decision Drivers

1. Privacy-first by construction: no cookies, no personal data, no cross-site
   tracking — the entire GDPR consent apparatus becomes unnecessary.
2. The beacon must be a no-op in dev, tests, and any deployment that has not
   explicitly opted in (environment-gated).
3. Script delivery must survive the strict CSP unchanged (same-origin
   self-proxy) and may carry an SRI hash.

## Considered Options

### Option A: Plausible, self-proxied and env-gated (CHOSEN)

Load Plausible's script from the site's own origin (`/js/script.js` via a
Vercel rewrite), with the event beacon proxied the same way (`/api/event`).
`src/lib/analytics.ts` injects the script only when both `VITE_PLAUSIBLE_SRC`
and `VITE_PLAUSIBLE_DOMAIN` are set.

- Pros: ~1 KB script, no cookies, no consent banner (GDPR-friendly by
  design), first-party-only network traffic (CSP `script-src 'self'` and
  `connect-src 'self'` remain valid), optional SRI, dead simple.
- Cons: costs ~9 EUR/month once the domain lands; data is only meaningful
  after the domain exists (which is exactly when the env pair gets set).

### Option B: GA4

- Pros: free, rich reports.
- Cons: consent banner required (cookie consent in the EU), heavyweight SDK
  (~50 KB+), third-party traffic breaks the strict CSP or forces a loosening,
  data ownership concerns. Rejected — it trades the site's quietness and
  privacy posture for report depth the author does not need.

### Option C: Umami self-hosted

- Pros: free, privacy-first, self-owned data.
- Cons: a second service (Postgres + Node) to operate and secure on the
  author's time; the site's thesis is "quiet and disciplined" — a self-hosted
  analytics stack is a standing maintenance surface for no advantage over
  Option A at this scale. Rejected for now; revisit if Plausible's pricing
  ever outweighs the upkeep.

### Option D: No analytics (status quo)

- Pros: zero cost, zero surface.
- Cons: the site stays unmeasurable; rejected because "the portfolio is a
  product" needs at least a minimal truth source, and Option A is tiny.

## Decision

Use Plausible, loaded by `src/lib/analytics.ts` strictly behind the
`VITE_PLAUSIBLE_SRC` + `VITE_PLAUSIBLE_DOMAIN` env pair (see `.env.example`).
The deploy step (with the real domain) adds two Vercel rewrites proxying
`/js/script.js` and `/api/event` to Plausible — the CSP in `vercel.json`
needs no change. SRI (`VITE_PLAUSIBLE_INTEGRITY`) is supported and
recommended at that point. Nothing is emitted in dev, tests, or pre-domain
deployments, and `e2e/case-study.e2e.ts` asserts exactly that.

## Consequences

- The bundle gains no third-party code; the runtime gains a script only when
  the deploy opts in.
- No consent banner, no cookie notice — privacy-first by construction.
- Data will only be meaningful once the domain is configured; until then the
  module is inert.
- If the provider changes later, only `src/lib/analytics.ts` and the two
  Vercel rewrites move — the env contract is generic.
- SECURITY.md's "third-party scripts should load with SRI" guidance is
  implemented as an option and exercised at activation.
