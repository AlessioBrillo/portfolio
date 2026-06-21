# Typography

> Decision record: [ADR-0007](../adr/0007-self-hosted-variable-fonts.md).

Three roles, chosen specifically _not_ to be the usual defaults (no Playfair, no
Inter).

- **Display / headings -> Fraunces** (variable). Humanist serif with soft optics —
  warm, a little Italian, authoritative with character. Used large and sparingly.
- **Body / UI -> Geist Sans.** Neutral modern grotesque, technical but legible.
- **Data / labels / eyebrow -> Geist Mono.** The dev/technical flavour — and it
  encodes _real information_: flight coordinates, dates, project metadata,
  altitude.

> An eyebrow that _means_ something, not decoration: above the aviation band,
> `45.6306° N · 8.7281° E — VDS` instead of a generic "AVIATION".

## Type scale (desktop; reduce ~15-20% on mobile)

| Use          | Font       | Size / line                               | Weight         |
| ------------ | ---------- | ----------------------------------------- | -------------- |
| Hero         | Fraunces   | `--text-hero` (clamp 3-6rem) / 1.02       | 400-500        |
| H2 section   | Fraunces   | `--text-h2` (clamp 2.25-3.5rem) / 1.1     | 500            |
| H3           | Geist Sans | `--text-h3` (clamp ~1.375-1.625rem) / 1.3 | 600            |
| Body         | Geist Sans | `--text-body` (clamp ~1.06-1.19rem) / 1.6 | 400            |
| Eyebrow/meta | Geist Mono | `--text-eyebrow` (~0.8rem) + tracking     | 500, UPPERCASE |

Family tokens live in the `@theme` block (`--font-display`, `--font-sans`,
`--font-mono`); the fluid size scale lives in `src/styles/typography.css`.
