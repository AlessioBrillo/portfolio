# ADR-0020: Plausible Self-Proxy Staged Before the Domain

## Metadata

| Field          | Value                                             |
| -------------- | ------------------------------------------------- |
| **Status**     | Accepted                                          |
| **Date**       | 2026-08-19                                        |
| **Authors**    | AlessioBrillo                                     |
| **Deciders**   | AlessioBrillo                                     |
| **Relates to** | ADR-0013 (analytics), ADR-0009 (CSP), vercel.json |
| **Project**    | The Ascent                                        |

## Context

ADR-0013 says the two Vercel rewrites (`/js/script.js` and `/api/event` ->
plausible.io) are added "at the deploy step (with the real domain)". The
rewrites are already committed in `vercel.json`, ahead of the domain. The
client stays inert regardless: `src/lib/analytics.ts` injects the script only
when both `VITE_PLAUSIBLE_SRC` and `VITE_PLAUSIBLE_DOMAIN` are set, and
`e2e/case-study.e2e.ts` asserts that no beacon is emitted in pre-domain
deployments.

## Decision Drivers

1. The rewrites are passive infrastructure, not behaviour: without the env
   pair no browser ever requests the proxy.
2. Removing them now would create a forgotten-step risk at domain time —
   the day the domain lands should be env-var-only, not routing surgery.
3. Exposure is bounded: plausible.io validates the `Origin` server-side, so
   beacons for an unregistered domain are dropped, and `/js/script.js` serves
   Plausible's static script.

## Decision

Keep the rewrites in `vercel.json` now; treat them as staged infrastructure.
Activation remains the `VITE_PLAUSIBLE_SRC` + `VITE_PLAUSIBLE_DOMAIN` env
pair, exactly as ADR-0013 decided. This ADR supersedes ADR-0013's deployment
note about _when_ the rewrites are added.

## Consequences

- No behavioural change anywhere: the CSP, the env contract and the e2e
  assertion are untouched.
- The day the domain lands, activation is env-var-only (plus an SRI hash,
  recommended by ADR-0013).
- If the provider changes, only `src/lib/analytics.ts` and the two rewrites
  move — unchanged from ADR-0013.
