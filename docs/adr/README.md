Superseded by 0021undefinedSuperseded by 0022undefinedSuperseded by 0021Superseded by 0022# Architecture Decision Records

This directory contains all Architecture Decision Records (ADRs) for **The
Ascent** (the personal portfolio). ADRs document the _why_ behind non-obvious
design choices so future maintainers (including future-you) can re-derive the
trade-offs without re-running the original arguments.

| ADR                                                  | Title                                                                                    | Date       | Status                     |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------- | -------------------------- |
| [0001](0001-single-page-ascent-architecture.md)      | Single-page "Ascent" architecture and tonal scroll journey                               | 2026-06-21 | Accepted                   |
| [0002](0002-frontend-stack.md)                       | Frontend stack — React + Vite + Tailwind + TypeScript                                    | 2026-06-21 | Accepted                   |
| [0003](0003-scroll-and-animation-engine.md)          | Scroll & animation engine — GSAP ScrollTrigger + Framer Motion                           | 2026-06-21 | Superseded by 0026         |
| [0004](0004-no-theme-toggle.md)                      | No dark/light toggle — the tonal journey is the theme                                    | 2026-06-21 | Accepted                   |
| [0005](0005-case-studies-as-mdx-routes.md)           | Case studies as MDX with shareable `/{domain}/{slug}` routes                             | 2026-06-21 | Accepted                   |
| [0006](0006-navigation-altitude-gauge.md)            | Navigation as an altitude gauge (no hamburger/classic menu)                              | 2026-06-21 | Accepted                   |
| [0007](0007-self-hosted-variable-fonts.md)           | Self-hosted variable fonts (Fraunces / Geist / Geist Mono)                               | 2026-06-21 | Superseded by 0022         |
| [0008](0008-visual-identity-palette.md)              | Visual identity & palette — "Terra -> Cielo -> Notte"                                    | 2026-06-21 | Superseded by 0021         |
| [0009](0009-accessibility-performance-floor.md)      | Accessibility & performance quality floor                                                | 2026-06-21 | Accepted                   |
| [0010](0010-flight-profile-tonal-bands.md)           | Flight-profile tonal bands (reframing the ascent)                                        | 2026-06-22 | Accepted                   |
| [0011](0011-scene-tone-publishing.md)                | Scene-tone publishing (live text tone for scene bands)                                   | 2026-08-11 | Accepted                   |
| [0012](0012-equal-legibility-flip-lines.md)          | Equal-legibility flip lines for scene text tone                                          | 2026-08-13 | Accepted                   |
| [0013](0013-analytics.md)                            | Privacy-first analytics, env-gated (Plausible)                                           | 2026-08-13 | Accepted                   |
| [0014](0014-identity-surface.md)                     | Identity surface — public repo link and resume on request                                | 2026-08-13 | Superseded in part by 0028 |
| [0015](0015-studies-navigation-order.md)             | Cross-study navigation in a curated reading order                                        | 2026-08-13 | Accepted                   |
| [0016](0016-photo-asset-caching.md)                  | Content-hashed photo assets with immutable caching                                       | 2026-08-16 | Accepted                   |
| [0017](0017-draft-visibility-noindex.md)             | Unpublished drafts stay out of search — robots noindex                                   | 2026-08-17 | Accepted                   |
| [0018](0018-bundle-size-budget.md)                   | The JavaScript payload has a CI-enforced budget                                          | 2026-08-18 | Accepted                   |
| [0019](0019-experiences-archive-route.md)            | The experiences archive is a real route                                                  | 2026-08-18 | Accepted                   |
| [0020](0020-plausible-proxy-staged-before-domain.md) | Plausible self-proxy staged before the domain                                            | 2026-08-19 | Superseded in part by 0024 |
| [0021](0021-palette-shift-brutalist.md)              | Palette shift — Swiss Industrial Print (brutalist)                                       | 2026-08-22 | Accepted                   |
| [0022](0021-palette-shift-brutalist.md)              | Typography overhaul — Archivo Black / JetBrains Mono (recorded inside the ADR-0021 file) | 2026-08-22 | Accepted                   |
| [0023](0023-body-floor-near-flips.md)                | Body contrast floor near flip lines (brutalist palette)                                  | 2026-09-05 | Accepted                   |
| [0024](0024-domain-landing-proxy-and-canonical.md)   | Domain landing — proxy mechanism, script cache, and canonical                            | 2026-09-06 | Accepted                   |
| [0025](0025-font-cache-not-immutable.md)             | Font binaries are not immutable — short cache for `/fonts/*`                             | 2026-09-07 | Accepted                   |
| [0026](0026-scroll-driven-tonal-engine.md)           | Tonal engine — layout-driven scroll handler, pure state fn                               | 2026-10-08 | Accepted                   |
| [0027](0027-vercel-git-integration-ci-gate.md)       | Deploy through Vercel Git integration; CI is the gate                                    | 2026-10-08 | Accepted                   |
| [0028](0028-published-resume-pdf-slot.md)            | Published resume PDF behind a contract-gated slot                                        | 2026-10-08 | Accepted                   |

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

ADR-0011 closes the follow-up ADR-0010 left open: it makes scene text follow the
live backdrop tone (published by the tonal engine through React context) so no
ink-family text ever sits on the night half of the flight.

ADR-0012 tunes the flip placement of ADR-0011 to each text family's
equal-legibility line. ADR-0013 and ADR-0014 open the finishing phase: the
first gates privacy-first analytics behind deploy-time environment variables,
the second activates the reserved resume hook and links the public repository.
ADR-0015 completes the case-study reading surface (ADR-0005): prev/next
navigation in the same curated order that drives the sitemap, with focus
management on hop.

ADR-0016 closes the photo pipeline's caching hole (ADR-0009's delivery floor):
derivative names embed a content hash so replacing a photo changes every URL
and the immutable `/photos/*` cache headers can never serve stale bytes.
