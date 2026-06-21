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
