# ADR-0027: Deploy through Vercel's Git Integration; CI Is the Gate

## Metadata

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| **Status**     | Accepted                               |
| **Date**       | 2026-10-08                             |
| **Authors**    | AlessioBrillo                          |
| **Deciders**   | AlessioBrillo                          |
| **Relates to** | ADR-0005, ADR-0020, ADR-0024           |
| **Supersedes** | N/A (replaces the CI deploy jobs only) |
| **Project**    | The Ascent                             |

## Context

`ci.yml` deployed with `amondnet/vercel-action`, gated on a `production`
environment and three Vercel secrets that were never configured. An audit found
it could not have worked end to end:

- the smoke step passed a full URL to `--apex`, which expects a bare host;
- the action rebuilt the site without `--prebuilt`, so the CI build was wasted;
- the runbook assumed Vercel's own Git integration, so both would have deployed;
- `scripts/domain-landing.mjs` called a non-existent `vercel scope`, relied on
  `jq` and `$(...)`, ran the smoke gate without `--url`, and its last step
  (widening `img-src` for a CDN) applies to no deployment this site has.

## Decision Drivers

- One deployer, so a merge can never produce two competing deployments.
- No long-lived Vercel token in GitHub; fewer secrets, smaller blast radius.
- The branch ruleset already forces a green, signed PR before anything reaches
  `main`, so CI does not need to also own the deploy to be authoritative.
- The smoke gate (ADR-0024) must still run against the exact published URL.

## Considered Options

### Option A: Keep deploying from CI with `vercel-action`

Rejected. It needs `VERCEL_TOKEN`, org and project ids as secrets, duplicates
the Git integration the runbook already assumes, and every Vercel CLI or action
upgrade becomes our maintenance (PR #198 was a bump of exactly that).

### Option B: Fix and keep the `domain-landing.mjs` orchestrator

Rejected. Most of the sequence is dashboard work (DNS, domain add, env
variables) that a script cannot do safely without a token, and an orchestrator
that has never run in anger is a liability at the one moment it matters. The
runbook stays the single source of truth.

### Option C: Vercel Git integration, CI as the gate, smoke on deployment status (chosen)

## Decision

- Vercel builds every PR (preview) and every merge to `main` (production).
- `ci.yml` only gates: lint, format, typecheck, tests with coverage, build,
  bundle budget, photo and deploy-routing contracts, the domain-mode dry run,
  and the E2E harness against both the dev server and the production build.
- `smoke.yml` listens for a successful **Production** `deployment_status`
  event and runs `npm run smoke` against `environment_url`.
- The deploy jobs, `scripts/domain-landing.mjs` and its helpers, and the
  `domain:land*` npm scripts are removed. `e2e.yml` is folded into `ci.yml`.
- The domain-mode build contract of ADR-0024 is unchanged and still enforced by
  the `domain-dry-run` job.

## Consequences

- **Positive:** a single deployer; no deploy secrets in GitHub; smaller CI;
  the first launch on `*.vercel.app` needs no code or secret changes.
- **Negative:** production deploys are not blocked by a CI failure on the
  deploy itself; protection comes from the ruleset (required checks on the PR)
  rather than from the pipeline order. A bad merge is rolled back with Vercel's
  "Promote previous deployment", per the runbook.
- **Neutral:** Dependabot's `vercel-action` bump is closed as obsolete.
