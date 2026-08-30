---
name: The Ascent
description: A single-page, scroll-driven portfolio where scrolling flies a flight profile — carta to notte and back — rendered in Italian Warmth / Editorial Serif aesthetic.
colors:
  accent: '#E9622E'
  accent-hover: '#D45828'
  carta: '#F4EFE6'
  carta-elevated: '#FAF8F3'
  ink: '#2A2722'
  ink-soft: '#5A544A'
  muted: '#8A8377'
  hairline-light: '#0000001A'
  notte: '#14161D'
  notte-elevated: '#1C1F26'
  panna: '#FBF8F2'
  panna-dim: '#B8B0A3'
  hairline-dark: '#FFFFFF1A'
  oliva: '#5E6B4F'
  oliva-hover: '#4D5A3E'
typography:
  display:
    fontFamily: 'Fraunces, Fraunces VF, ui-serif, Georgia, serif'
    fontSize: 'clamp(4.5rem, 8vw, 12rem)'
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: '-0.03em'
    textTransform: 'none'
  sector:
    fontFamily: 'Fraunces, Fraunces VF, ui-serif, Georgia, serif'
    fontSize: 'clamp(2.5rem, 4vw, 5rem)'
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: '-0.02em'
    textTransform: 'none'
  headline:
    fontFamily: 'Fraunces, Fraunces VF, ui-serif, Georgia, serif'
    fontSize: 'clamp(2rem, 3vw, 3.5rem)'
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: '-0.02em'
    textTransform: 'none'
  title:
    fontFamily: 'Geist Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 'normal'
    textTransform: 'normal'
  body:
    fontFamily: 'Geist Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)'
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 'normal'
    textTransform: 'normal'
  label:
    fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, monospace'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: '0.1em'
    textTransform: 'uppercase'
  micro:
    fontFamily: 'Geist Mono, ui-monospace, SFMono-Regular, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: '0.1em'
    textTransform: 'uppercase'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
spacing:
  hairline: '1px'
  hairline-thick: '2px'
  section: 'clamp(8rem, 6rem + 8vw, 14rem)'
  unit: '4px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.md}'
    padding: '1rem 2rem'
    border: '{spacing.hairline-thick} solid transparent'
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)'
  button-primary-hover:
    borderColor: '{colors.ink}'
    transform: 'translateY(-4px) scale(0.98)'
  eyebrow:
    textColor: '{colors.ink-soft}'
    typography: '{typography.label}'
  mosaic-tile:
    backgroundColor: '{colors.carta}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '1.5rem'
    border: '{spacing.hairline-thick} solid {colors.hairline-light}'
    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  mosaic-tile-hover:
    transform: 'translateY(-8px)'
    borderColor: '{colors.accent}'
---

# Design System: The Ascent — Italian Warmth / Editorial Serif

## 1. Overview

**Creative North Star: "Italian Warmth / Editorial Serif / Flight Narrative"**

This portfolio is a flight profile — scrolling climbs from ground (carta tones, daylight) to cruise (notte) and descends back through alba to carta before the notte landing. The visual language is **Italian Warmth**: editorial serif display type (Fraunces), warm paper substrate, signature orange accent, and olive for the natural/sport side. It rejects the generic AI-generator aesthetic (cream paper + humanist serif + terracotta) AND the industrial brutalist aesthetic (hazard red + Archivo Black + CRT) in favor of a personal, warm, editorial voice that feels Italian, aviation-rooted, and intellectually serious.

**Archetype: Italian Warmth / Editorial Serif** — applied consistently across both light (carta) and dark (notte) substrates.

### Key Characteristics

- **One accent only**: Aviation Orange (`#E9622E`) — the thread that ties the whole ascent together. Used for structural hairlines, critical data highlights, and the final CTA. Never diluted.
- **Natural accent**: Olive (`#5E6B4F`) — used sparingly for sport outdoor, nature, cura.
- **Editorial typographic contrast**: Macro (Fraunces, large, generous leading, no uppercase) vs. Micro (Geist Mono, fixed small, generous tracking, uppercase).
- **Soft but contained radii**: 4–12px. Not mechanical zero-radius, not bloated bubbles.
- **Visible compartmentalization**: Blueprint grid with 1px hairlines, ASCII framing (`[ ]`, `>>>`, corner markers), structural horizontal rules.
- **Flight-profile tonal bands**: Carta → Foschia → Notte (cruise) → Alba → Carta (descent) → Notte (landing), driven by GSAP ScrollTrigger with equal-legibility flip lines (ADR-0012).
- **AA-or-better contrast** at every blend instant; reduced motion is a first-class path.

## 2. Colors

A **Italian Warmth** palette: warm carta daylight, blue-black notte night, aviation orange, olive nature.

### Light Substrate (Carta Bands)

| Role             | Token                    | Value       | Notes                                        |
| ---------------- | ------------------------ | ----------- | -------------------------------------------- |
| Background       | `--color-carta`          | `#F4EFE6`   | Warm, unbleached documentation paper         |
| Elevated surface | `--color-carta-elevated` | `#FAF8F3`   | Cards, modals on carta                       |
| Primary text     | `--color-ink`            | `#2A2722`   | Warm ink — deep brown-black for max contrast |
| Muted text       | `--color-ink-soft`       | `#5A544A`   | Captions, metadata on carta (8.3:1 AA)       |
| General muted    | `--color-muted`          | `#8A8377`   | Legacy, being phased out                     |
| Hairline         | `--color-hairline-light` | `#0000001A` | 1px structural lines on carta                |

### Dark Substrate (Notte Bands)

| Role             | Token                    | Value       | Notes                                     |
| ---------------- | ------------------------ | ----------- | ----------------------------------------- |
| Background       | `--color-notte`          | `#14161D`   | Blue-black night — deeper than pure black |
| Elevated surface | `--color-notte-elevated` | `#1C1F26`   | Cards, modals on notte                    |
| Primary text     | `--color-panna`          | `#FBF8F2`   | Warm cream/phosphor emission              |
| Muted text       | `--color-panna-dim`      | `#B8B0A3`   | Captions, metadata on notte (4.8:1 AA)    |
| Hairline         | `--color-hairline-dark`  | `#FFFFFF1A` | 1px structural lines on notte             |

### Accent (Universal)

| Role         | Token                  | Value     | Notes                         |
| ------------ | ---------------------- | --------- | ----------------------------- |
| Accent       | `--color-accent`       | `#E9622E` | Aviation Orange — sole accent |
| Accent hover | `--color-accent-hover` | `#D45828` | Slightly darker for active    |

### Natural Accent

| Role        | Token                 | Value     | Notes                       |
| ----------- | --------------------- | --------- | --------------------------- |
| Olive       | `--color-oliva`       | `#5E6B4F` | Nature, sport outdoor, cura |
| Olive hover | `--color-oliva-hover` | `#4D5A3E` | Active state                |

### Named Rules

**The Single Accent Rule.** Orange appears on a small fraction of any view; its rarity is the signal. If orange is doing decoration, remove it. No second accent besides olive (used sparingly for nature/sport).

**The True Substrate Rule.**

- **Carta** is `#F4EFE6` (warm paper), not cool newsprint (`#F4F4F0`).
- **Notte** is `#14161D` (blue-black), not pure CRT black (`#0A0A0A`).
- The generic AI palette (cool cream + humanist serif + terracotta) is explicitly avoided.
- The industrial brutalist palette (hazard red + Archivo Black + CRT) is explicitly avoided.

**The Panna Rule.** Text on notte is warm cream (`#FBF8F2`), never pure white (`#FFFFFF`). The flip lines (ADR-0012) are computed against these exact values.

## 3. Typography

**Display / Titoli → Fraunces** (variable, OFL). Humanist serif, soft optical, warm, Italian character. Used large with generous leading, no uppercase.
**Corpo / UI → Geist Sans** (variable, OFL). Neutral grotesque, modern, tech but readable.
**Dati / Etichette / Eyebrow → Geist Mono** (variable, OFL). Technical monospace for telemetry.

### Hierarchy

| Role            | Family     | Scale                                    | Weight | Leading | Tracking | Case   |
| --------------- | ---------- | ---------------------------------------- | ------ | ------- | -------- | ------ |
| Macro Hero      | Fraunces   | `clamp(4.5rem, 8vw, 12rem)`              | 500    | 1.02    | -0.03em  | Normal |
| Sector (H2)     | Fraunces   | `clamp(2.5rem, 4vw, 5rem)`               | 500    | 1.1     | -0.02em  | Normal |
| Headline (H3)   | Fraunces   | `clamp(2rem, 3vw, 3.5rem)`               | 500    | 1.1     | -0.02em  | Normal |
| Title           | Geist Sans | `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)` | 600    | 1.1     | 0        | Normal |
| Body            | Geist Sans | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | 400    | 1.6     | 0        | Normal |
| Label/Eyebrow   | Geist Mono | 0.75rem                                  | 500    | 1.4     | 0.1em    | UPPER  |
| Micro/Telemetry | Geist Mono | 0.75rem                                  | 400    | 1.4     | 0.1em    | UPPER  |

### Tracking Scale

- `--tracking-tight: -0.03em` — Macro headlines
- `--tracking-tight-sm: -0.02em` — Sector / H2
- `--tracking-normal: 0` — Body
- `--tracking-wide: 0.05em` — Links, buttons
- `--tracking-wider: 0.1em` — Micro telemetry
- `--tracking-widest: 0.15em` — Dense data clusters

### Leading Scale

- `--leading-tight: 1.02` — Macro
- `--leading-snug: 1.1` — Sector
- `--leading-normal: 1.4` — Micro
- `--leading-relaxed: 1.6` — Body

### Named Rules

**The Real-Data Rule.** The mono label carries true information — `45.6306° N · 8.7281° E — VDS`, a date, an altitude, a stack, a revision — never a decorative "ABOUT" kicker. If the eyebrow doesn't say something true, it doesn't ship.

**The Semantic Element Rule.** Eyebrows use `<data>`, `<samp>`, `<kbd>` per content type — never generic `<span>`. This is machine-readable telemetry.

**The Editorial Contrast Rule.** Fraunces macro and Geist Mono micro exist at opposite ends of the scale. No intermediate "display" sizes that dilute the contrast. The gap _is_ the hierarchy.

**No Uppercase on Display.** Fraunces is a serif with character — use sentence case, not uppercase. Uppercase is reserved for mono telemetry only.

## 4. Layout & Spatial Engineering

**Blueprint Grid** — 12-column CSS Grid with 1px gap trick (`gap: var(--grid-gap)` on parent with contrasting background) generating mathematically perfect hairlines without complex borders.

### Principles

- **Visible compartmentalization**: Every zone delineated by solid hairlines (`1px` or `2px`). Horizontal rules (`<hr>`) span full container width.
- **Generous vertical rhythm**: Extreme vertical space between bands (`--space-section`).
- **Soft radii**: `--radius-sm: 4px`, `--radius-md: 8px`, `--radius-lg: 12px`. No zero-radius mechanical corners, no bloated bubbles.
- **Grid determinism**: `display: grid; gap: 1px;` with parent/child background contrast for razor-thin dividing lines.

### Spacing

- `--space-section: clamp(8rem, 6rem + 8vw, 14rem)` — Extreme vertical rhythm between bands
- `--space-unit: 4px` — Base unit
- `--container-page: 75rem` — Max content width
- `--grid-columns: 12` — Blueprint columns
- `--grid-gap: 1px` — Visible grid lines

## 5. UI Components & Symbology

### Syntax Decoration (ASCII Framing)

- **Section eyebrows**: `[ SECTOR 01 · CHARACTER · ENTERPRISING · ADVENTUROUS · CURIOUS ]` — `<data>` element
- **Ghost links**: `>>> CONTACT` — prepended on hover via `::before`
- **Card corners**: ASCII corner markers via `::before`/`::after` (top-left, bottom-right)
- **Directional**: `>>>`, `///`, `\\` for flow indication

### Industrial Markers

- Registration (`®`), copyright (`©`), trademark (`™`) as structural glyphs
- Crosshairs (`+`) at grid intersections
- Repeating vertical lines (barcode patterns)
- Thick horizontal warning stripes (accent orange)
- Randomized technical strings: `REV 2.6`, `UNIT / D-01`, `CHKSUM A7F3`

### Buttons

- **Shape**: Soft radius (`rounded-md`, 8px)
- **Primary**: Solid aviation orange (`#E9622E`) with ink (`#2A2722`) label in tracked mono — 4.83:1, AA-safe. Reserved for **final CTA only**.
- **Border**: 2px transparent at rest; reveals ink border on hover
- **Hover**: `-translate-y-1` + ink border
- **Active**: `scale-[0.98] translate-y-[1px]` — mechanical press

### Mosaic Tile (Signature)

- **Corner Style**: Soft radius (8px), ASCII corners
- **Background**: Band's own tone (carta on light, notte on dark) at 80% opacity
- **Border**: 2px hairline at rest (`ink/10` or `panna/10`); turns aviation orange on hover
- **Hover**: `-translate-y-2` + accent edge. No shadow.
- **Internal Padding**: 1.5rem — composed piece, not dense CMS grid

### Ghost Link

- Mono, uppercase, generous tracking (`0.1em`)
- Prepends `>>> ` on hover (opacity transition)
- Current text color (`text-current`) — tone-aware

### Navigation — Altitude Gauge (Signature)

- Fixed vertical bar (desktop) / top progress bar (mobile)
- Labels: `GROUND · CLIMB · MOSAIC · CRUISE · OPS LOG · DESCENT · ARCHIVE · NIGHT` in mono
- Orange marks current band; labels are smooth-scroll anchors
- Tracks flight profile (rises and falls — ADR-0010)

## 6. Textural & Post-Processing Effects

All effects respect `prefers-reduced-motion: reduce` — disabled entirely when set.

### Global Mechanical Noise

- Low-opacity SVG fractal noise overlay on `<html>` (`opacity: 0.025`)
- Unified physical grain across both light and dark modes

### CRT Scanlines (Notte Bands Only)

- `repeating-linear-gradient` simulating horizontal electron beam sweeps
- Subtle flicker animation (8s cycle) — `.scanlines` class
- Applied to notte-band sections and notte-only components

### Constellation Easter Egg

- Press `↑` on notte bands to reveal subtle star field
- 8-second fade-in/out animation
- Respects reduced motion (disabled)

## 7. Motion

**Editorial, not springy.** Sharp easing, measured reveals, staggered entry.

### Easing

- `--ease-sharp: cubic-bezier(0.4, 0, 0.2, 1)` — Primary (editorial sharp)
- `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` — Legacy, being phased out

### Durations

- `--duration-fast: 150ms` — Micro interactions (hover, press)
- `--duration-normal: 300ms` — Standard transitions (tile hover, border flash)
- `--duration-slow: 600ms` — Macro reveals (section entry, tonal crossfade)

### Reveal Pattern

- Staggered editorial entry: sequential, not springy
- Reduced offset — editorial reveals are measured
- `prefers-reduced-motion`: instant, no stagger

### Tonal Crossfade

- GSAP ScrollTrigger drives backdrop blend (carta ↔ foschia ↔ notte ↔ alba ↔ carta ↔ notte)
- Equal-legibility flip lines per transition (ADR-0012)
- Body text family (ink/panna) clears ≥ 4.5:1 at every instant
- Muted text family (ink-soft/panna-dim) bounded at documented floor ≥ 1.57:1
- Reduced motion: discrete switch at body flip line

## 8. Web Engineering Directives

1. **Grid Determinism**: `display: grid; gap: 1px;` with contrasting parent/child backgrounds for mathematically perfect hairlines.
2. **Semantic Rigor**: `<data>`, `<samp>`, `<kbd>`, `<output>`, `<dl>` for telemetry — never generic `<div>`/`<span>`.
3. **Typography Clamping**: `clamp()` exclusively for macro typography; micro is fixed.
4. **Font Loading**: Variable WOFF2 subsetted; `font-display: optional`; preload macro + body.
5. **Token Contract**: `src/lib/tokens.test.ts` guards CSS↔JS token parity.
6. **Tone Context**: Scene bands consume `SceneToneContext` (ADR-0011) — never hardcode band tones in scene.

## 9. Do's and Don'ts

### Do:

- **Do** keep aviation orange to a small fraction of any view; let its rarity be the signal.
- **Do** make every mono eyebrow carry true data (coordinates, dates, altitude, stack, rev).
- **Do** build depth from tone, space, and 1px hairlines — atmosphere over elevation.
- **Do** pair on the contrast axis: Fraunces macro against Geist Sans body against Geist Mono micro.
- **Do** give `prefers-reduced-motion` a real path: tonal shifts instant, reveals off, textures off.
- **Do** verify every text/background pair against AA at every blend instant.
- **Do** use the blueprint grid (`grid-blueprint`) for all major layouts.
- **Do** use ASCII framing (`[ ]`, `>>>`, corners) for structural decoration.
- **Do** use Fraunces with sentence case — it has character, don't uppercase it.

### Don't:

- **Don't** ship the **generic AI-generator look** — cool cream + humanist serif + terracotta accent.
- **Don't** ship the **industrial brutalist look** — hazard red + Archivo Black + CRT + zero radius.
- **Don't** use `border-radius: 0` — ever. Corners are soft (4-12px).
- **Don't** use `box-shadow` or glassmorphism to fake depth. Use tone and space.
- **Don't** dilute orange into decorative fills, or use it as small body text.
- **Don't** add a dark/light toggle. Tone follows altitude; the journey is the theme.
- **Don't** use pure white (`#FFFFFF`) on notte — use panna (`#FBF8F2`).
- **Don't** use Fraunces in uppercase — it's a serif with character, use sentence case.
- **Don't** use Geist Sans for micro — use Geist Mono.
- **Don't** mix Italian Warmth with Industrial Brutalist — pick one archetype.

---

## 10. Reference ADRs

- ADR-0010 (Flight Profile)
- ADR-0012 (Equal-Legibility Flip Lines)
- ADR-0003 (Scroll Engine)
- ADR-0009 (Accessibility Performance Floor)
- ADR-0021 (Palette Shift - Italian Warmth)
- ADR-0022 (Typography Overhaul - Editorial Serif)
