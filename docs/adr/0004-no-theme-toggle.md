# ADR-0004: No Dark/Light Toggle — the Tonal Journey Is the Theme

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-06-21                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Supersedes** | N/A                          |
| **Relates to** | ADR-0001, ADR-0003, ADR-0009 |
| **Project**    | The Ascent                   |

## Context

Most sites expose a dark/light switch. Here, light and dark are not states the
user picks — they are positions on the climb. A toggle would undercut the central
metaphor and turn a narrative into a setting.

## Decision Drivers

1. **Narrative integrity** — the tone _is_ altitude; a switch breaks it.
2. **Single point of view** — the site is opinionated by design.
3. **Accessibility floor** — choosing no toggle must not harm contrast or motion
   accessibility.

## Considered Options

### Option A: No theme toggle; tone follows altitude (CHOSEN)

The only optional override is an accessibility-driven "reduce motion / static"
mode.

### Option B: Conventional dark/light toggle

Rejected: contradicts ADR-0001 and the brief's "no switch" requirement.

### Option C: Respect `prefers-color-scheme` to flip the whole palette

Rejected: the palette is intentionally fixed per band; a global inversion would
fight the designed contrast and the ground-to-night story.

## Decision

Ship no dark/light toggle. The tonal journey is the theme. Provide only a
reduced-motion path (ADR-0009) so the experience degrades gracefully. A hidden
hook for a future résumé link is documented in
`docs/content/personalization.md`, but it is not a theme control.

## Consequences

- **Positive:** the metaphor stays intact; fewer states to design and test.
- **Negative:** users who strongly prefer a uniform dark UI are not served — an
  accepted, deliberate trade-off.
