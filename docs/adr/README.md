# Architecture Decision Records

This directory contains all Architecture Decision Records (ADRs) for **The
Ascent** (the personal portfolio). ADRs document the _why_ behind non-obvious
design choices so future maintainers (including future-you) can re-derive the
trade-offs without re-running the original arguments.

| ADR                                             | Title                                                          | Date       | Status   |
| ----------------------------------------------- | -------------------------------------------------------------- | ---------- | -------- |
| [0001](0001-single-page-ascent-architecture.md) | Single-page "Ascent" architecture and tonal scroll journey     | 2026-06-21 | Accepted |
| [0002](0002-frontend-stack.md)                  | Frontend stack — React + Vite + Tailwind + TypeScript          | 2026-06-21 | Accepted |
| [0003](0003-scroll-and-animation-engine.md)     | Scroll & animation engine — GSAP ScrollTrigger + Framer Motion | 2026-06-21 | Accepted |
| [0004](0004-no-theme-toggle.md)                 | No dark/light toggle — the tonal journey is the theme          | 2026-06-21 | Accepted |
| [0005](0005-case-studies-as-mdx-routes.md)      | Case studies as MDX with shareable `/{domain}/{slug}` routes   | 2026-06-21 | Accepted |
| [0006](0006-navigation-altitude-gauge.md)       | Navigation as an altitude gauge (no hamburger/classic menu)    | 2026-06-21 | Accepted |
| [0007](0007-self-hosted-variable-fonts.md)      | Self-hosted variable fonts (Fraunces / Geist / Geist Mono)     | 2026-06-21 | Accepted |
| [0008](0008-visual-identity-palette.md)         | Visual identity & palette — "Terra -> Cielo -> Notte"          | 2026-06-21 | Accepted |
| [0009](0009-accessibility-performance-floor.md) | Accessibility & performance quality floor                      | 2026-06-21 | Accepted |
| [0010](0010-flight-profile-tonal-bands.md)      | Flight-profile tonal bands (reframing the ascent)              | 2026-06-22 | Accepted |

## Conventions

- Numbering is sequential and zero-padded (`NNNN-title-with-dashes.md`).
- Status is one of `Proposed`, `Accepted`, `Superseded`, `Deprecated`.
- ADRs are immutable once Accepted. A change of mind produces a new ADR that
  supersedes the old one — never an edit in place.
- The MADR-style structure (Metadata -> Context -> Decision Drivers -> Considered
  Options -> Decision -> Consequences) is the source of truth for ADR shape.
- Every ADR records at least two considered alternatives, including the rejected
  ones, with the reason for rejection.

## Provenance

ADR-0001 through ADR-0009 distil the architectural decisions from the original
private design paper into immutable records. The remaining (non-architectural)
content of that paper — the design system, page architecture, content direction,
and roadmap — lives under `docs/design-system/`, `docs/architecture/`,
`docs/content/`, and `docs/roadmap.md`. The source paper itself is intentionally
kept out of the repository.

ADR-0010 is the first post-paper decision: it reconciles a contradiction the paper
carried (a monotonic "climb" framing over an intentionally oscillating light/dark
sequence) by reframing the journey as a flight profile.
