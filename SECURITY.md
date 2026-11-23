# Security Policy

This is a static, content-only personal site with no backend, no authentication,
no forms, no cookies and no local storage. It does process technical data: the
hosting provider receives the usual request metadata (IP address, User-Agent,
URL, referrer, timestamp), and an env-gated, cookieless Plausible proxy receives
the IP address transiently to count unique visitors. The processing is described
in the site's Privacy page and summarised in `docs/legal/analytics-assessment.md`.
The attack surface is correspondingly small.

## Reporting a vulnerability

If you find a security issue (for example in a dependency, the build, or the
deployment configuration), please report it privately by email to
**alessio@ilcassero.it** rather than opening a public issue.

Please include enough detail to reproduce the problem. You can expect an
acknowledgement within a reasonable timeframe.

## Scope notes

- No secrets belong in this repository; the analytics and deploy configuration
  lives in environment variables, never committed values.
- Third-party scripts load through the same-origin proxy with an optional SRI
  hash (`VITE_PLAUSIBLE_INTEGRITY`) and are gated on both env vars being set.
- A production Content Security Policy should be configured at deploy time.

## Known, accepted hardening debt

- `vercel.json` ships `style-src 'self' 'unsafe-inline'`. The inline allowance
  was introduced for the GSAP tonal engine (ADR-0003). The current engine
  (ADR-0026) writes the backdrop colour through the CSSOM, which `style-src`
  does not govern, and React sets `aspect-ratio` reservations (ADR-0009) the same
  way, so the allowance is probably removable. It stays until a dedicated pass
  (strict policy + the full E2E harness) proves nothing else needs it. This is
  documented debt, not an oversight. The rest of
  the policy is strict: `script-src 'self'` (no inline scripts, no eval), no
  third-party origins, `object-src 'none'`, `frame-ancestors 'none'`.
- The SPA fallback rewrites unknown paths to `index.html` (ADR-0005's deep
  links), so a nonexistent `/{domain}/{slug}` returns HTTP 200 with a
  client-rendered 404 page. Acceptable for a personal site; revisit if the
  site ever needs precise crawler signalling for invalid URLs.
