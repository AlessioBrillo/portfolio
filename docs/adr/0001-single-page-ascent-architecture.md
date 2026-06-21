# ADR-0001: Single-Page "Ascent" Architecture and Tonal Scroll Journey

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-06-21                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Supersedes** | N/A                          |
| **Relates to** | ADR-0003, ADR-0004, ADR-0006 |
| **Project**    | The Ascent                   |

## Context

The portfolio must serve three audiences at once: a recruiter who needs rigour
fast, a curious visitor who wants to discover the person, and a prospective
client who needs credibility. The brief rules out separate, navigable pages —
everything should live "under one roof, as pieces of a puzzle, with evident
distinctions" — and asks for an alternating light/dark experience "without a
switch".

The author's identity as a pilot supplies the unifying device: scrolling the
page is gaining altitude. The site opens at ground level (full daylight, paper
tones) and climbs through bands — haze, clear, altitude, night — each band a
domain of the author's life. Light and dark are not a toggle; they are the
journey.

## Decision Drivers

1. **One roof, evident distinctions** — a single continuous climb, but each band
   carries its own tone and label.
2. **Light/dark without a switch** — tone changes with altitude, motivated by the
   author's story rather than a gratuitous effect.
3. **Depth on demand** — surface-level curation that expands into long case
   studies for those who dig.
4. **Credibility for a recruiter first** — the serious professional material sits
   high and deep, reachable immediately.

## Considered Options

### Option A: Single-page tonal ascent (CHOSEN)

One long page, top-to-bottom = ground-to-night, with a mosaic index that expands
into deep case studies.

### Option B: Multi-page site (home + per-section routes)

Classic IA with a nav menu. Rejected: contradicts the "one roof" brief and loses
the signature continuity that makes the light/dark transition meaningful.

### Option C: Horizontal/slide deck experience

A controlled, slide-based journey. Rejected: fights the native scroll interaction
(especially on mobile) and adds interaction cost without narrative payoff.

## Decision

Build a single-page experience whose vertical order is the ascent. Case studies
are the one exception to "single page": they are dedicated, shareable routes
(see ADR-0005). Navigation is the altitude gauge (see ADR-0006), and the tonal
transition is the only scenographic effect (see ADR-0003).

## Consequences

- **Positive:** the structure itself tells the story; the light/dark requirement
  is satisfied without UI chrome; recruiters reach depth quickly.
- **Negative:** a long single page demands disciplined orientation (mitigated by
  the altitude gauge) and careful performance budgeting.
- **Follow-up:** section order and band tones are specified in
  `docs/architecture/page-architecture.md`.
