# ADR-0021: Palette Shift — Swiss Industrial Print (Brutalist)

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-08-22                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Supersedes** | ADR-0008 (visual identity)   |
| **Relates to** | ADR-0009, ADR-0010, ADR-0012 |
| **Project**    | The Ascent                   |

## Context

The Industrial Brutalist UI skill mandates a single-archetype commitment: **Swiss Industrial Print** (light substrate) or **Tactical Telemetry** (dark substrate). The portfolio's narrative _is_ a climb from paper to night and back, requiring one archetype applied consistently across both substrates.

The original "Terra → Cielo → Notte" palette (ADR-0008) used a warm terracotta orange (`#E9622E`) and a blue-black night (`#14161D`). The brutalist interpretation requires:

- A pure **hazard/aviation red** (`#E61919`) as the sole accent — no terracotta warmth
- **Newsprint** (`#F4F4F0`) paper — slightly cooler, more matte
- **Deactivated CRT** (`#0A0A0A`) night — deeper, not blue-tinted
- Removal of olive (second accent violates single-accent discipline)

## Decision Drivers

1. **Single archetype compliance** — Swiss Industrial Print across all bands
2. **Single accent discipline** — one red, no olive, no dilution
3. **AA contrast at every blend instant** — ADR-0012 flip lines must hold with new palette
4. **Tonal engine compatibility** — flip lines recomputed at module load via `flipLineFor`

## Considered Options

### Option A: Swiss Industrial Print with brutalist dark interpretation (CHOSEN)

Light substrate: Newsprint `#F4F4F0`, Carbon Ink `#050505`, Hazard Red `#E61919`
Dark substrate: Deactivated CRT `#0A0A0A`, White Phosphor `#EAEAEA`, same Hazard Red

Tonal engine recomputes equal-legibility flip lines against new backdrop colours. Body family (ink/phosphor) clears 4.5:1 at flip lines. Muted family (ink-soft/phosphor-dim) bounded at documented floor (~1.57:1).

### Option B: Tactical Telemetry archetype for night bands only

Rejected: Skill explicitly forbids mixing archetypes within one interface.

### Option C: Keep original palette, add brutalist textures only

Rejected: Terracotta orange and blue-black night are identifiably "generator look" — the brutalist discipline requires hazard red and true CRT black.

## Decision

Adopt **Option A**.

### Palette

| Role             | Light (Paper)                       | Dark (Night)                       |
| ---------------- | ----------------------------------- | ---------------------------------- |
| Background       | `--color-paper: #F4F4F0`            | `--color-night: #0A0A0A`           |
| Elevated surface | `--color-paper-elevated: #FFFFFF`   | `--color-night-elevated: #121212`  |
| Primary text     | `--color-ink: #050505`              | `--color-phosphor: #EAEAEA`        |
| Muted text       | `--color-ink-soft: #48453F`         | `--color-phosphor-dim: #8D8D8D`    |
| Accent           | `--color-accent: #E61919`           | `--color-accent: #E61919`          |
| Hairline         | `--color-hairline-light: #0000001A` | `--color-hairline-dark: #FFFFFF1A` |

### Legacy Aliases (Tonal Engine)

The following tokens are retained as aliases for `src/lib/tone.ts` compatibility during transition:

```css
--color-orange: #e61919; /* maps to --color-accent */
--color-cream: #fffdf6; /* maps to --color-phosphor */
--color-muted-light: #8a8377; /* maps to --color-ink-soft */
--color-muted-dark: #7b8190; /* maps to --color-phosphor-dim */
--color-ink-deep: #221e19; /* unused in brutalist */
--color-olive: #5e6b4f; /* deprecated — remove post-migration */
```

### Flip Line Recalculation

`src/lib/tone.ts` recomputes `BODY_FLIP_LINE` and `SOFT_FLIP_LINE` at module load via `flipLineFor()` using the new `TONE`, `TEXT_TONE`, `SOFT_TEXT_TONE` constants. The unit test suite (`tone.test.ts`) gates the AA sweep.

## Consequences

- **Positive:** Single archetype compliance; pure hazard red signals authority; deeper night increases phosphor contrast; olive removed simplifies system.
- **Negative:** Legacy components using `olive`, `ink-deep`, `cream` tokens need migration; tonal engine flip lines shift (recomputed automatically); design docs (DESIGN.md, color.md) need update.
- **Testing:** `tone.test.ts` validates AA ≥ 4.54:1 at body flip lines, muted floor ≥ 1.57:1. Playwright harness sweeps both crossfades.

## Migration Plan

1. Update `src/styles/tokens.css` @theme block (done)
2. Update `src/lib/tone.ts` constants (done)
3. Update `src/styles/typography.css` @font-face for new fonts (done)
4. Migrate components off deprecated tokens (Phase 2)
5. Update DESIGN.md, color.md documentation (Phase 4)
6. Remove deprecated tokens after component migration complete

---

# ADR-0022: Typography Overhaul — Archivo Black / JetBrains Mono

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-08-22                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Supersedes** | ADR-0007 (self-hosted fonts) |
| **Relates to** | ADR-0021                     |
| **Project**    | The Ascent                   |

## Context

The Industrial Brutalist skill mandates extreme typographic contrast:

- **Macro**: Heavy industrial sans (Neue Haas Grotesk Black / Archivo Black), massive scale, negative tracking, compressed leading, UPPERCASE
- **Micro**: Technical monospace (JetBrains Mono / IBM Plex Mono), fixed small scale, generous tracking, UPPERCASE

The original stack (Fraunces display, Geist Sans body, Geist Mono data) uses a humanist serif for display — elegant but not "industrial brutalist." The skill requires a heavy sans-serif for structural headers.

## Decision Drivers

1. **Archetype compliance** — Macro must be heavy sans, not serif
2. **Variable font performance** — Single file per family, full weight range
3. **Self-hosted** — No external CDN (ADR-0007 principle retained)
4. **License clarity** — Archivo Black (OFL), JetBrains Mono (OFL) — both free for commercial use

## Considered Options

### Option A: Archivo Black (macro) + Geist Sans (body) + JetBrains Mono (micro) (CHOSEN)

- Archivo Black: OFL, variable (400-900), strong industrial character, wide glyphs suit negative tracking
- Geist Sans: Retained for body — neutral grotesque, already self-hosted, variable
- JetBrains Mono: OFL, variable (100-800), technical monospace, excellent at small sizes

### Option B: Neue Haas Grotesk Black (commercial license)

Rejected: Requires paid license; not suitable for personal portfolio without budget.

### Option C: Inter Black (macro) + Inter (body) + JetBrains Mono

Rejected: Inter lacks the "industrial" weight contrast — Archivo Black is purpose-built for heavy display.

### Option D: Keep Fraunces, add brutalist textures

Rejected: Serif display contradicts the archetype's "Swiss industrial print" mandate.

## Decision

Adopt **Option A**.

### Font Stack

| Role                             | Family                      | Weights       | Source                                |
| -------------------------------- | --------------------------- | ------------- | ------------------------------------- |
| Macro (display, sector, H2)      | `Archivo Black` / `Archivo` | 900 / 400-900 | Google Fonts (OFL), self-hosted WOFF2 |
| Body (UI, prose)                 | `Geist Sans`                | 100-900       | Vercel (OFL), self-hosted WOFF2       |
| Micro (eyebrow, meta, telemetry) | `JetBrains Mono`            | 100-800       | JetBrains (OFL), self-hosted WOFF2    |

### Fluid Scale (tokens.css)

```css
--text-macro: clamp(4rem, 10vw, 15rem); /* Hero, massive */
--text-macro-sm: clamp(3rem, 6vw, 8rem); /* Sector headers */
--text-sector: clamp(2.5rem, 4vw, 5rem); /* Section H2 */
--text-h2: clamp(2rem, 3vw, 3.5rem); /* Sub-headings */
--text-h3: clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem);
--text-body: clamp(0.9375rem, 0.9rem + 0.2vw, 1rem);
--text-body-sm: 0.875rem;
--text-micro: 0.75rem; /* Fixed, not fluid */
--text-micro-sm: 0.6875rem;
--text-eyebrow: 0.75rem;
```

### Tracking Scale

```css
--tracking-tight: -0.06em; /* Macro headlines */
--tracking-tight-sm: -0.04em; /* Sector / H2 */
--tracking-normal: 0; /* Body */
--tracking-wide: 0.05em; /* Links, buttons */
--tracking-wider: 0.1em; /* Micro telemetry */
--tracking-widest: 0.15em; /* Dense data clusters */
```

### Leading Scale

```css
--leading-none: 0.85; /* Macro */
--leading-tight: 0.95; /* Sector */
--leading-snug: 1.1; /* H2/H3 */
--leading-normal: 1.4; /* Micro */
--leading-relaxed: 1.5; /* Body */
```

## Consequences

- **Positive:** Extreme macro/micro contrast defines the brutalist aesthetic; Archivo Black's wide glyphs hold at negative tracking; JetBrains Mono is purpose-built for code/telemetry; all OFL licenses.
- **Negative:** Fraunces removed (was brand-defining); font files must be downloaded, subsetted, committed; body size reduced may affect readability for some users (mitigated by 1.5 leading).
- **Performance:** Three variable WOFF2 files (~120KB total subsetted); preload macro + body; mono loaded async.
- **Testing:** Visual regression via Playwright; font loading measured via `font-display: optional`.

## Migration Plan

1. Add `@font-face` for Archivo, Archivo Black, JetBrains Mono (done)
2. Update `@theme` `--font-display`, `--font-mono` (done)
3. Add fluid scale tokens (done)
4. Migrate components to new utility classes (Phase 2)
5. Download/subset font binaries to `public/fonts/` (pre-launch)
6. Update DESIGN.md, typography.md (Phase 4)
