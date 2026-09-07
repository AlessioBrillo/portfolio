# Domain Deployment Runbook — The Ascent

**Purpose**: Zero-surprise deployment checklist for the production domain.
**Trigger**: Domain purchased and ready to configure.
**Authority**: This runbook is the _only_ source of truth for deploy order. No step is optional.

---

## Execution Mode

### Automated Path (Recommended)

Run the idempotent orchestrator that executes every step below in order,
with pre-condition validation, rollback instructions, and dry-run support:

```bash
# Preview what would happen (safe, no mutations)
npm run domain:land:dry

# Execute the full landing sequence
npm run domain:land
```

The orchestrator (`scripts/domain-landing.mjs`) runs Steps 1–8 below
automatically. It exits with distinct codes per failure mode and prints
rollback commands. Re-run from a specific step with `--step=N` after fixing.

### Manual Path (Fallback)

Follow Steps 1–8 manually if automation is unavailable or for audit.

---

## Prerequisites (Verify Before Starting)

- [ ] Domain purchased and DNS control available
- [ ] Vercel account with project connected to `main` branch
- [ ] Plausible account created, site added (domain registered in Plausible)
- [ ] Local `main` branch clean, all gates green:
  ```bash
  npm run typecheck && npm run lint && npm run format:check && npm test && npm run build && npm run photos:check && npm run bundle:check
  ```
- [ ] `.env.production.local` populated with `VITE_SITE_URL=https://<domain>`
      (and optionally `VITE_PLAUSIBLE_SRC`, `VITE_PLAUSIBLE_DOMAIN`)

---

## Step 1: DNS Configuration

| Record | Type  | Value                  | TTL  | Notes             |
| ------ | ----- | ---------------------- | ---- | ----------------- |
| `@`    | A     | `76.76.21.21`          | 3600 | Vercel Anycast IP |
| `www`  | CNAME | `cname.vercel-dns.com` | 3600 | Vercel managed    |

**Verify**: `dig +short @1.1.1.1 <domain>` returns `76.76.21.21`

---

## Step 2: Vercel Domain Add

1. Vercel Dashboard → Project → Settings → Domains
2. Add `<domain>` and `www.<domain>`
3. Wait for "Valid Configuration" (green checkmark)
4. Enable the redirect `www.<domain>` → `<domain>` (apex is canonical,
   ADR-0024) — no duplicate-content surface, ever

---

## Step 3: Environment Variables (Vercel Project Settings → Environment Variables)

Set **all** variables for **Production** and **Preview** environments:

> After changing any variable below, **rebuild/redeploy** — the client bakes
> the `VITE_*` pair at build time while the Edge middleware reads it at
> request time (ADR-0024). An env-only change without a rebuild desyncs them
> (script injected but proxy 404, or vice versa).

| Variable                   | Value                               | Example                     | Scope                |
| -------------------------- | ----------------------------------- | --------------------------- | -------------------- |
| `VITE_SITE_URL`            | `https://<domain>`                  | `https://alessiobrillo.com` | Production           |
| `VITE_PLAUSIBLE_SRC`       | `https://plausible.io/js/script.js` | (fixed)                     | Production + Preview |
| `VITE_PLAUSIBLE_DOMAIN`    | `<domain>`                          | `alessiobrillo.com`         | Production + Preview |
| `VITE_PLAUSIBLE_INTEGRITY` | `sha384-<hash>`                     | See Step 3.1                | Production           |

> Preview shares the env pair on purpose (Step 5 verifies the active proxy
> before production), but preview traffic then counts under the same
> `data-domain`: exclude the `*.vercel.app` hostnames in the Plausible
> dashboard (Settings → Segments / filtered views) so launch-day numbers
> reflect the apex only.

### Step 3.1: Generate SRI Hash (Production Only)

```bash
# Fetch the exact script Plausible will serve
curl -sL "https://plausible.io/js/script.js" -o /tmp/plausible-script.js

# Generate sha384 SRI hash
openssl dgst -sha384 -binary /tmp/plausible-script.js | base64

# Output format: sha384-<base64>
# Paste into VITE_PLAUSIBLE_INTEGRITY in Vercel (Production only)
```

**Why**: Hardens the self-proxied script against supply-chain compromise (ADR-0013).

> **Rotation protocol**: the hash pins the exact bytes Plausible serves today.
> The proxied script is cached for an hour (`max-age=3600`, ADR-0024), but an
> upstream Plausible rotation changes the bytes under the same URL — the next
> deploy then ships a stale hash and browsers block the script silently.
> After any analytics outage with no deploy of ours, re-run the commands above
> and compare with the value in Vercel: mismatch means rotation. Update
> `VITE_PLAUSIBLE_INTEGRITY` (Production) and **rebuild/redeploy** — the client
> bakes the hash at build time (ADR-0024). If rotation churn ever becomes
> operational noise, drop the hash and rely on the same-origin proxy + CSP.

---

## Step 4: Local Verification Build

```bash
# Ensure clean state
git status  # should be clean

# Full gate (must pass)
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build && npm run photos:check && npm run bundle:check
```

**If `bundle:check` FAILS** (expected on next case study per roadmap):

1. Measure actual sizes: `npm run bundle:report`
2. Identify offending chunk(s)
3. Either:
   - **Shave**: Inline tables, remove unused deps, code-split heavier sections
   - **Accept regression deliberately**: raise `entryChunkKb` / `totalJsKb`
     in `bundle-baseline-gzip.json` and `bundle-baseline-brotli.json` with
     the measured numbers, then refresh the per-chunk inventory:
     `npm run bundle:check -- --update-baseline --origin "<reason>"`
     (the flag never raises budgets by itself)
     - **Mandatory**: Update `origin` field with reason (e.g., "Added physics-of-flight case study, +12 kB entry chunk")
     - Commit both baseline files with message: `chore: re-baseline bundle budget after <study> (ADR-0018)`
4. Re-run full gate until green

---

## Step 5: Push & Verify Preview Deploy

```bash
git push origin main
```

1. Wait for Vercel Preview deploy (auto-triggered on push)
2. Open preview URL
3. Verify:
   - [ ] Hero loads, name visible
   - [ ] Tonal crossfade works (scroll through ai-physics → sky-sport)
   - [ ] Contact section renders solid night
   - [ ] Footer renders solid night
   - [ ] No console errors
   - [ ] **Smoke gate green** (covers the middleware, the proxy paths, the
         CSP, and the security headers — no hand-reading the Network tab):
     ```bash
     npm run smoke -- --url <preview-url>
     ```
     All checks must be `pass` or `skip` (a `skip` on `sitemap` is
     correct while the domain is not live yet). Any `fail` blocks the
     promote in Step 6.

---

## Step 6: Production Deploy & Domain Verification

1. Vercel Dashboard → Deployments → Promote Preview to Production
   OR merge PR to `main` (auto-deploys to production)
2. Wait for production deploy (green checkmark)
3. Open `https://<domain>`
4. Run the smoke gate against production (now with the apex redirect check):
   ```bash
   npm run smoke -- --url https://<domain> --apex <domain>
   ```
   Zero `fail` allowed — on failure, roll back immediately (see below) and
   investigate on `main`.
5. Verify **all** of the above PLUS:
   - [ ] `www.<domain>` 301-redirects to the apex (canonical, ADR-0024)
   - [ ] Canonical links present on case-study routes (`<link rel="canonical" href="https://<domain>/ai/transformer-italian-corpus">`)
   - [ ] `sitemap.xml` served at `https://<domain>/sitemap.xml` with correct URLs
   - [ ] `robots.txt` served with `Sitemap: https://<domain>/sitemap.xml`
   - [ ] OG image loads: `https://<domain>/og-image.png` (automatic: `postbuild` finalizes `dist/index.html` from `VITE_SITE_URL`, no code change)
   - [ ] Plausible beacon fires: Network tab → `/api/event` → 200 OK → response from plausible.io
   - [ ] CSP headers correct: `script-src 'self'` (no third-party), `style-src 'self' 'unsafe-inline'`

---

## Step 7: Post-Deploy Smoke Tests

```bash
# Run E2E suite against production (optional but recommended)
BASE_URL=https://<domain> npm run e2e
```

**If any E2E test fails**: Rollback via Vercel (Previous Deployment → Promote to Production) and investigate.

---

## Step 8: Monitoring Setup (Optional, Phase 7)

- [ ] Plausible dashboard shows real-time visitors
- [ ] Vercel Analytics enabled (free, no config)
- [ ] Uptime monitor (e.g., UptimeRobot) on `https://<domain>`

---

## Rollback Procedure

If critical issue discovered post-deploy:

1. Vercel Dashboard → Deployments → Find last known-good deployment
2. Click "..." → "Promote to Production" (instant — DNS already points at
   Vercel after the first cutover, so no TTL wait; the 3600s TTL only
   mattered when the apex first moved)
3. Create hotfix branch from `main`, fix, PR, merge

---

## Reference: File Changes This Deploy Enables

| File                                                     | Change                                                                                                   | ADR      |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- |
| `middleware.ts`                                          | Edge Middleware for conditional Plausible proxy                                                          | ADR-0020 |
| `vercel.json`                                            | Removed static Plausible rewrites; SPA fallback only                                                     | ADR-0020 |
| `src/lib/analytics.ts`                                   | Uses `/js/script.js` + `/api/event` (proxied by middleware)                                              | ADR-0013 |
| `.env.example`                                           | Documents all 5 deploy-time variables                                                                    | —        |
| `src/lib/dist-finalize.ts` + `scripts/finalize-dist.mjs` | Postbuild: absolute og:image, JSON-LD `url`, `Sitemap:` line in `dist/` only when `VITE_SITE_URL` is set | —        |
| `bundle-baseline-gzip.json` + `-brotli.json`             | Updated if regression accepted (Step 4)                                                                  | ADR-0018 |

---

## Emergency Contacts

- **Vercel Support**: Dashboard → Help
- **Plausible Support**: Settings → Help
- **DNS Provider**: Your registrar's support

---

**Last Updated**: 2026-08-26
**Next Review**: After first production deploy
