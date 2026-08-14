# Security Policy

This is a static, content-only personal site with no backend, no authentication,
and no user data collection. The attack surface is correspondingly small.

## Reporting a vulnerability

If you find a security issue (for example in a dependency, the build, or the
deployment configuration), please report it privately by email to
**alessio@ilcassero.it** rather than opening a public issue.

Please include enough detail to reproduce the problem. You can expect an
acknowledgement within a reasonable timeframe.

## Scope notes

- No secrets belong in this repository; configuration for any future analytics or
  deploy hooks must use environment variables, never committed values.
- Third-party scripts (if added later) should load with SRI and be audited.
- A production Content Security Policy should be configured at deploy time.

## Known, accepted hardening debt

- `vercel.json` ships `style-src 'self' 'unsafe-inline'`. The inline allowance
  is **required by the tonal engine** (ADR-0003): GSAP owns the backdrop's
  paint and mutates inline `background-color` styles on scroll, and React
  renders inline `aspect-ratio` reservations (ADR-0009). This is documented
  debt, not an oversight — removing it would break the signature. The rest of
  the policy is strict: `script-src 'self'` (no inline scripts, no eval), no
  third-party origins, `object-src 'none'`, `frame-ancestors 'none'`.
- The SPA fallback rewrites unknown paths to `index.html` (ADR-0005's deep
  links), so a nonexistent `/{domain}/{slug}` returns HTTP 200 with a
  client-rendered 404 page. Acceptable for a personal site; revisit if the
  site ever needs precise crawler signalling for invalid URLs.
