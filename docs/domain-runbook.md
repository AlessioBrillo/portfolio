# Domain Runbook

The day the real domain lands. Everything below is already built and
gated — this checklist is the order of operations to activate it, nothing
here is new code.

## Prereq: the interim deployment

The site is deployable on an interim `*.vercel.app` origin today. The
architecture already keeps that origin honest: no canonical links
(`canonicalOrigin` returns `''` while `VITE_SITE_URL` is unset), no
sitemap (the postbuild step skips), `og:image` stays relative. Deploying
interim is the first production validation of the CSP headers, the
immutable asset caching, the SPA fallback and the tonal signature on a
real device — do it before the domain, not after.

## The day of the domain

1. **Set `VITE_SITE_URL`** to the canonical origin (e.g. `https://example.com`).
   - Canonical links appear on every case-study route (`canonicalStudyUrl`).
   - `dist/sitemap.xml` is emitted by `postbuild` (`scripts/generate-sitemap.mjs`).
   - Verify: `curl -s https://<domain>/sitemap.xml | head` — every published
     study URL present.
2. **Make `og:image` absolute** in `index.html` (`https://<domain>/og-image.png`).
   Relative `og:image` URLs are dropped by LinkedIn/WhatsApp/iMessage.
   Regenerate the card source `docs/design/og-image.svg` first if it is stale.
3. **Add the `Sitemap:` line to `robots.txt`** (`https://<domain>/sitemap.xml`).
4. **Activate analytics** (ADR-0013, ADR-0020) in the deployment env:
   - `VITE_PLAUSIBLE_SRC=https://<domain>/js/script.js`
   - `VITE_PLAUSIBLE_DOMAIN=<domain>`
   - Optional `VITE_PLAUSIBLE_API=https://<domain>/api/event`, plus an
     `VITE_PLAUSIBLE_INTEGRITY` SRI hash of the script (`sha384-...`).
   - Register `<domain>` in Plausible — the proxy drops beacons for
     unregistered domains server-side.
   - Verify: load the site, confirm one request to `/js/script.js` and one
     `/api/event` in the network tab; then confirm the event appears in the
     Plausible dashboard.
5. **Verify social cards**: paste the homepage URL into LinkedIn and a
   WhatsApp/iMessage chat — card image, title and description must render.
6. **Re-verify the strict headers** on the production origin:
   `curl -sI https://<domain>/` → CSP, HSTS, X-Content-Type-Options,
   Referrer-Policy, Permissions-Policy all present.
7. **Re-run the full gate** against the production build:
   `npm run e2e:preview` (the production-build harness) plus
   `npm run deploy:check` and `npm run photos:check`.

## Signing decision

`SITE` in `src/lib/site.ts` owns the identity: full name, tagline, email,
LinkedIn, GitHub. Sign as the full name or a small personal brand — the
change is one file. The JSON-LD `sameAs` block in `index.html` mirrors
`SITE.linkedinUrl` and must be updated in the same commit (documented
exception to `SITE`'s data ownership).

## Post-activation hygiene

- `docs/roadmap.md` is the truth ledger: close Phase 6, move the analytics
  activation note from "waits on the domain" to "live".
- The interim-origin canonical policy (no canonical, no sitemap) must never
  be relaxed before the domain lands.
