# ADR-0009: Accessibility & Performance Quality Floor

## Metadata

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| **Status**     | Accepted                               |
| **Date**       | 2026-06-21                             |
| **Authors**    | AlessioBrillo                          |
| **Deciders**   | AlessioBrillo                          |
| **Supersedes** | N/A                                    |
| **Relates to** | ADR-0003, ADR-0006, ADR-0007, ADR-0008 |
| **Project**    | The Ascent                             |

## Context

The site is a craft showcase; its quality floor is part of the message. An
animation-heavy single page can easily regress on accessibility and Core Web
Vitals, so the non-negotiables are set as a decision rather than left implicit.

## Decision Drivers

1. **Inclusive by default** — keyboard, screen reader, reduced motion.
2. **Contrast** — AA across all text pairs; accent used as accent only.
3. **Performance** — fast first paint despite rich motion.
4. **Verifiable** — targets that can be checked in CI / Lighthouse.

## Considered Options

### Option A: Adopt an explicit, testable quality floor (CHOSEN)

WCAG AA contrast; `prefers-reduced-motion` collapses tonal transitions to instant
and disables parallax/reveals; visible keyboard focus (orange ring); correct
heading order, real `alt` text, ARIA landmarks; self-hosted subset fonts;
AVIF/WebP + lazy-load imagery; target LCP < 2.5s and ~0 layout shift.

### Option B: "Make it accessible later"

Rejected: retrofitting a11y onto a motion-driven page is costly and usually
incomplete; it also undercuts the showcase claim.

### Option C: Maximal effects, accept the a11y/perf cost

Rejected: incompatible with the brand's "quiet quality" and with EU expectations.

## Decision

Treat the above as a hard floor for every surface. Motion respects reduced-motion
at the CSS layer (already wired in `index.css`) and the `useReducedMotion` hook;
the orange focus ring is global. Lighthouse/CWV checks are added in the
finishing roadmap phase.

## Consequences

- **Positive:** the quality floor reinforces the portfolio's central claim and is
  measurable.
- **Negative:** every new effect carries an accessibility and performance budget
  obligation — by design.
