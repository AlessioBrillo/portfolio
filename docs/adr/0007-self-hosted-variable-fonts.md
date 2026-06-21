# ADR-0007: Self-Hosted Variable Fonts (Fraunces / Geist / Geist Mono)

## Metadata

| Field          | Value              |
| -------------- | ------------------ |
| **Status**     | Accepted           |
| **Date**       | 2026-06-21         |
| **Authors**    | AlessioBrillo      |
| **Deciders**   | AlessioBrillo      |
| **Supersedes** | N/A                |
| **Relates to** | ADR-0002, ADR-0009 |
| **Project**    | The Ascent         |

## Context

Typography carries the editorial character of the site. Three roles are needed: a
humanist display serif with warmth, a clean modern grotesque for UI/body, and a
technical monospace for data-bearing labels (dates, coordinates, altitude). The
defaults everyone reaches for (Playfair, Inter) are explicitly avoided.

## Decision Drivers

1. **Distinct character** — not the generic generator look.
2. **Performance & privacy** — no third-party font CDN dependency or request.
3. **Variable axes** — one file per family covering the needed weights.
4. **Accessibility** — `font-display: swap`, legible body sizes.

## Considered Options

### Option A: Self-hosted variable Fraunces + Geist Sans + Geist Mono (CHOSEN)

Subset, self-hosted `.woff2`, loaded with `font-display: swap`.

### Option B: Google Fonts CDN

Rejected: third-party request, privacy/consent implications, and a render
dependency on an external origin.

### Option C: System font stack only

Rejected: loses the editorial display serif that defines the brand voice.

## Decision

Self-host Fraunces (display), Geist Sans (UI/body), and Geist Mono (data/eyebrow)
as variable `.woff2`. Until the binaries are added, the `@theme` fallback stacks
apply; `@font-face` declarations are staged (commented) in
`src/styles/typography.css`. Font files are intentionally **not** committed in the
scaffold (see `src/assets/fonts/README.md`).

## Consequences

- **Positive:** unique voice, fast and private font delivery, only the critical
  weight preloaded.
- **Negative:** font binaries must be sourced and subset before launch — a
  documented roadmap input.
