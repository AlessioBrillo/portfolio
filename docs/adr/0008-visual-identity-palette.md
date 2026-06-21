# ADR-0008: Visual Identity & Palette — "Terra -> Cielo -> Notte"

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-06-21                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Supersedes** | N/A                          |
| **Relates to** | ADR-0001, ADR-0004, ADR-0009 |
| **Project**    | The Ascent                   |

## Context

The fashionable "cream + serif + terracotta" look is close to the desired warmth
but is also the look every generator now produces. The portfolio needs an
identity that reads as the author's own, not a template.

## Decision Drivers

1. **Recognisably personal** — not a default template palette.
2. **One true accent** — a single signature colour that threads the whole climb.
3. **Tonal range for the ascent** — warm ground tones and a deep high-altitude
   night.
4. **AA contrast** — body text pairs must pass AA (ADR-0009).

## Considered Options

### Option A: Keep Italian warmth + orange, shift dark band to night-blue, add olive (CHOSEN)

Six named tokens: Orange (`#E9622E`, sole accent), Paper (`#F4EFE6`), Night
(`#14161D`, blue-black not brown), Olive (`#5E6B4F`, sparing nature accent), Ink
(`#2A2722`), Cream (`#FBF8F2`).

### Option B: The default cream + terracotta + warm-black

Rejected: indistinguishable from generated portfolios; no personal signal.

### Option C: High-saturation, multi-accent palette

Rejected: violates the "one accent" discipline and the quiet luxury direction.

## Decision

Adopt the "Terra -> Cielo -> Notte" palette with orange as the single accent and
olive used sparingly for the nature/outdoor band. The golden rule: orange is the
heartbeat from ground to night and is never diluted across many decorative uses.
Tokens live in the `@theme` block of `src/index.css`. Full usage rules are in
`docs/design-system/color.md`.

## Consequences

- **Positive:** a palette that is identifiably the author's; a disciplined accent
  that ties the puzzle together.
- **Negative:** orange must be policed as accent-only (large titles/details, never
  small body text) to preserve contrast and restraint.
