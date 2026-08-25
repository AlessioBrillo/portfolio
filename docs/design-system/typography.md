# Typography — Industrial Brutalist (Archivo Black / JetBrains Mono)

> Decision record: [ADR-0022](../adr/0021-palette-shift-brutalist.md#adr-0022-typography-overhaul--archivo-black--jetbrains-mono).

**Three roles, extreme contrast axis — no serif for display, no Inter for body.**

- **Macro (Display/Sector/H2) → Archivo Black** (variable, 900). Heavy industrial sans, wide glyphs hold at negative tracking. Massive scale, compressed leading, UPPERCASE. The structural architecture.
- **Body (UI/Prose) → Geist Sans** (variable, 400). Neutral grotesque, already self-hosted. Readable at small sizes, unobtrusive.
- **Micro (Eyebrow/Meta/Telemetry) → JetBrains Mono** (variable, 400-500). Technical monospace, purpose-built for code/telemetry. Fixed small scale, generous tracking, UPPERCASE. Encodes _real information_: coordinates, dates, altitude, stack, revisions.

> An eyebrow that _means_ something, not decoration: above the hero, `[ 45.6306° N · 8.7281° E — VDS ]` instead of a generic "INTRO".

## Type Scale (Fluid via `clamp()`)

| Use             | Token             | Size / Leading                                 | Weight | Tracking | Case   |
| --------------- | ----------------- | ---------------------------------------------- | ------ | -------- | ------ |
| Macro Hero      | `--text-macro`    | `clamp(4rem, 10vw, 15rem)` / 0.85              | 900    | -0.06em  | UPPER  |
| Sector Macro    | `--text-macro-sm` | `clamp(3rem, 6vw, 8rem)` / 0.85                | 900    | -0.04em  | UPPER  |
| Section H2      | `--text-sector`   | `clamp(2.5rem, 4vw, 5rem)` / 0.95              | 900    | -0.04em  | UPPER  |
| Sub-heading     | `--text-h2`       | `clamp(2rem, 3vw, 3.5rem)` / 1.1               | 900    | -0.02em  | UPPER  |
| Tile Title      | `--text-h3`       | `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)` / 1.1 | 600    | normal   | Normal |
| Body            | `--text-body`     | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` / 1.5 | 400    | normal   | Normal |
| Body Small      | `--text-body-sm`  | 0.875rem / 1.5                                 | 400    | normal   | Normal |
| Label/Eyebrow   | `--text-eyebrow`  | 0.75rem / 1.4                                  | 500    | 0.1em    | UPPER  |
| Micro Telemetry | `--text-micro`    | 0.75rem / 1.4                                  | 400    | 0.1em    | UPPER  |
| Micro Small     | `--text-micro-sm` | 0.6875rem / 1.4                                | 400    | 0.15em   | UPPER  |

## Tracking Scale (Tokens)

| Token                 | Value   | Use                       |
| --------------------- | ------- | ------------------------- |
| `--tracking-tight`    | -0.06em | Macro headlines           |
| `--tracking-tight-sm` | -0.04em | Sector / H2               |
| `--tracking-normal`   | 0       | Body                      |
| `--tracking-wide`     | 0.05em  | Links, buttons            |
| `--tracking-wider`    | 0.1em   | Micro telemetry, eyebrows |
| `--tracking-widest`   | 0.15em  | Dense data clusters       |

## Leading Scale (Tokens)

| Token               | Value | Use    |
| ------------------- | ----- | ------ |
| `--leading-none`    | 0.85  | Macro  |
| `--leading-tight`   | 0.95  | Sector |
| `--leading-snug`    | 1.1   | H2/H3  |
| `--leading-normal`  | 1.4   | Micro  |
| `--leading-relaxed` | 1.5   | Body   |

## Font Stack (CSS)

```css
/* Macro: Archivo Black — heavy industrial sans */
--font-display: 'Archivo Black', 'Archivo', ui-sans-serif, system-ui, sans-serif;

/* Body: Geist Sans — neutral grotesque */
--font-sans: 'Geist Sans', ui-sans-serif, system-ui, -apple-system, sans-serif;

/* Micro: JetBrains Mono — technical monospace */
--font-mono: 'JetBrains Mono', 'Geist Mono', ui-monospace, 'SFMono-Regular', monospace;
```

## @font-face (Self-Hosted Variable WOFF2)

All fonts self-hosted in `/public/fonts/` with `font-display: optional`.

```css
@font-face {
  font-family: 'Archivo';
  src: url('/fonts/Archivo.woff2') format('woff2-variations');
  font-weight: 400 900;
  font-stretch: 75% 125%;
  font-style: normal;
  font-display: optional;
}

@font-face {
  font-family: 'Archivo Black';
  src: url('/fonts/Archivo.woff2') format('woff2-variations');
  font-weight: 900;
  font-style: normal;
  font-display: optional;
}

@font-face {
  font-family: 'Geist Sans';
  src: url('/fonts/Geist.woff2') format('woff2');
  font-weight: 100 900;
  font-style: normal;
  font-display: optional;
}

@font-face {
  font-family: 'JetBrains Mono';
  src: url('/fonts/JetBrainsMono.woff2') format('woff2-variations');
  font-weight: 100 800;
  font-style: normal;
  font-display: optional;
}
```

## Performance

- 3 variable WOFF2 files (~120KB total subsetted)
- Preload: Archivo (macro) + Geist Sans (body) — critical path
- JetBrains Mono loaded async (non-blocking)
- `font-display: optional` — no layout shift, no FOIT/FOUT

## Semantic Elements for Micro Typography

| Element    | Use Case                             | Example                            |
| ---------- | ------------------------------------ | ---------------------------------- |
| `<data>`   | Telemetry, coordinates, measurements | `[ 45.6306° N · 8.7281° E — VDS ]` |
| `<samp>`   | System output, readings              | `ALT 12,500 FT`                    |
| `<kbd>`    | Input, commands                      | `CTRL + SHIFT + P`                 |
| `<output>` | Calculated results                   | `ΔV = 3.2 km/s`                    |

## Named Rules

**The Real-Data Rule.** The mono label carries true information — coordinates, dates, altitude, stack, revision — never a decorative "ABOUT" kicker. If the eyebrow doesn't say something true, it doesn't ship.

**The Semantic Element Rule.** Eyebrows use `<data>`, `<samp>`, `<kbd>`, `<output>` per content type — never generic `<span>`. This is machine-readable telemetry.

**The Extreme Contrast Rule.** Macro and Micro exist at opposite ends of the scale. No intermediate "display" sizes that dilute the contrast. The gap _is_ the hierarchy.

**The Negative Tracking Rule.** Macro headlines use negative tracking (`-0.04em` to `-0.06em`) forcing glyphs into solid architectural blocks. Archivo Black's wide glyphs are purpose-built for this.

**The Generous Tracking Rule.** Micro telemetry uses generous tracking (`0.1em` to `0.15em`) simulating mechanical typewriter spacing or terminal matrices.

## Deprecated (replaced)

| Legacy                        | Replacement                    | Reason                                             |
| ----------------------------- | ------------------------------ | -------------------------------------------------- |
| Fraunces (serif display)      | Archivo Black (sans display)   | Serif contradicts Swiss Industrial Print archetype |
| Geist Mono (micro)            | JetBrains Mono (micro)         | JetBrains Mono purpose-built for telemetry         |
| `text-hero` (clamp 3-6rem)    | `text-macro` (clamp 4-15rem)   | Larger scale, tighter leading                      |
| `text-h2` (clamp 2.25-3.5rem) | `text-sector` (clamp 2.5-5rem) | Sector-scale naming per flight profile             |

---

**Reference**: [ADR-0022](../adr/0021-palette-shift-brutalist.md#adr-0022-typography-overhaul--archivo-black--jetbrains-mono), [ADR-0007](../adr/0007-self-hosted-variable-fonts.md), [ADR-0021](../adr/0021-palette-shift-brutalist.md).
