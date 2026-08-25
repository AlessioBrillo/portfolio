---
name: The Ascent
description: A single-page, scroll-driven portfolio where scrolling flies a flight profile — paper to night and back — rendered in Industrial Brutalist / Swiss Industrial Print aesthetic.
colors:
  accent: '#E61919'
  paper: '#F4F4F0'
  paper-elevated: '#FFFFFF'
  ink: '#000000'
  ink-soft: '#48453F'
  muted: '#8A8377'
  hairline-light: '#0000001A'
  night: '#0A0A0A'
  night-elevated: '#121212'
  phosphor: '#FFFFFF'
  phosphor-dim: '#9E9E9E'
  hairline-dark: '#FFFFFF1A'
typography:
  display:
    fontFamily: 'Archivo Black, Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(4rem, 10vw, 15rem)'
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: '-0.06em'
    textTransform: 'uppercase'
  sector:
    fontFamily: 'Archivo Black, Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.5rem, 4vw, 5rem)'
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: '-0.04em'
    textTransform: 'uppercase'
  headline:
    fontFamily: 'Archivo Black, Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2rem, 3vw, 3.5rem)'
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: '-0.02em'
    textTransform: 'uppercase'
  title:
    fontFamily: 'Geist Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 'normal'
  body:
    fontFamily: 'Geist Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
  label:
    fontFamily: 'JetBrains Mono, Geist Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: '0.1em'
    textTransform: 'uppercase'
  micro:
    fontFamily: 'JetBrains Mono, Geist Mono, ui-monospace, monospace'
    fontSize: '0.75rem'
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: '0.1em'
    textTransform: 'uppercase'
rounded:
  none: '0'
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
    rounded: '{rounded.none}'
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
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.none}'
    padding: '1.5rem'
    border: '{spacing.hairline-thick} solid {colors.hairline-light}'
    transition: 'transform 300ms cubic-bezier(0.4, 0, 0.2, 1), border-color 300ms cubic-bezier(0.4, 0, 0.2, 1)'
  mosaic-tile-hover:
    transform: 'translateY(-8px)'
    borderColor: '{colors.accent}'
---

# Design System: The Ascent — Industrial Brutalist

## 1. Overview

**Creative North Star: "Swiss Industrial Print / Tactical Telemetry"**

This portfolio is a flight profile — scrolling climbs from ground (paper tones, daylight) to cruise (night) and descends back to daylight before the night landing. The visual language is **Industrial Brutalist**: mid-century Swiss Typographic design fused with retro-futuristic aerospace/military terminal interfaces. It rejects the generic AI-generator aesthetic (cream paper + humanist serif + terracotta) in favor of raw functionality, mechanical precision, and high data density.

**Archetype: Swiss Industrial Print** — applied consistently across both light (paper) and dark (night) substrates. This is a single-archetype commitment per the Industrial Brutalist skill; we do not mix Swiss Industrial Print with Tactical Telemetry.

### Key Characteristics

- **One accent only**: Aviation/Hazard Red (`#E61919`) — never diluted, never decorative. Used for structural hairlines, critical data highlights, and the final CTA.
- **Extreme typographic contrast**: Macro (Archivo Black, massive, negative tracking, compressed leading, UPPERCASE) vs. Micro (JetBrains Mono, fixed small, generous tracking, UPPERCASE).
- **Zero radius**: All corners 90° — mechanical rigidity, no softness.
- **Visible compartmentalization**: Blueprint grid with 1px hairlines, ASCII framing (`[ ]`, `>>>`, corner markers), structural horizontal rules.
- **Simulated analog degradation**: Global mechanical noise, halftone/dither overlays, CRT scanlines (night only), phosphor glow — all respecting `prefers-reduced-motion`.
- **Flight-profile tonal bands**: Paper → Night → Paper → Night, driven by GSAP ScrollTrigger with equal-legibility flip lines (ADR-0012).
- **AA-or-better contrast** at every blend instant; reduced motion is a first-class path.

## 2. Colors

A **Swiss Industrial Print** palette: matte newsprint daylight, deactivated CRT night, pure hazard red.

### Light Substrate (Paper Bands)

| Role             | Token                    | Value       | Notes                                        |
| ---------------- | ------------------------ | ----------- | -------------------------------------------- |
| Background       | `--color-paper`          | `#F4F4F0`   | Matte, unbleached documentation paper        |
| Elevated surface | `--color-paper-elevated` | `#FFFFFF`   | Cards, modals on paper                       |
| Primary text     | `--color-ink`            | `#000000`   | Carbon ink — full black for maximum contrast |
| Muted text       | `--color-ink-soft`       | `#48453F`   | Captions, metadata on paper (8.3:1)          |
| General muted    | `--color-muted`          | `#8A8377`   | Legacy, being phased out                     |
| Hairline         | `--color-hairline-light` | `#0000001A` | 1px structural lines on paper                |

### Dark Substrate (Night Bands)

| Role             | Token                    | Value       | Notes                                    |
| ---------------- | ------------------------ | ----------- | ---------------------------------------- |
| Background       | `--color-night`          | `#0A0A0A`   | Deactivated CRT — deeper than blue-black |
| Elevated surface | `--color-night-elevated` | `#121212`   | Cards, modals on night                   |
| Primary text     | `--color-phosphor`       | `#FFFFFF`   | White phosphor emission                  |
| Muted text       | `--color-phosphor-dim`   | `#9E9E9E`   | Captions, metadata on night (4.8:1)      |
| Hairline         | `--color-hairline-dark`  | `#FFFFFF1A` | 1px structural lines on night            |

### Accent (Universal)

| Role         | Token                  | Value     | Notes                             |
| ------------ | ---------------------- | --------- | --------------------------------- |
| Accent       | `--color-accent`       | `#E61919` | Aviation/Hazard Red — sole accent |
| Accent hover | `--color-accent-hover` | `#CC1515` | Slightly darker for active state  |

### Named Rules

**The Single Accent Rule.** Red appears on a small fraction of any view; its rarity is the signal. If red is doing decoration, remove it. No olive, no second accent.

**The True Black Rule.** Night is `#0A0A0A` (deactivated CRT), not blue-black (`#14161D`). Paper is `#F4F4F0` (newsprint), not warm cream (`#F4EFE6`). The generic AI palette is explicitly avoided.

**The Phosphor Rule.** Text on night is white phosphor (`#FFFFFF`), never cream (`#FBF8F2`). The flip lines (ADR-0012) are computed against these exact values.

## 3. Typography

**Macro: Archivo Black** — heavy industrial sans, wide glyphs hold at negative tracking, OFL license.
**Body: Geist Sans** — neutral grotesque, variable, already self-hosted.
**Micro: JetBrains Mono** — technical monospace, purpose-built for telemetry, OFL license.

### Hierarchy

| Role            | Family         | Scale                                    | Weight | Leading | Tracking | Case   |
| --------------- | -------------- | ---------------------------------------- | ------ | ------- | -------- | ------ |
| Macro Hero      | Archivo Black  | `clamp(4rem, 10vw, 15rem)`               | 900    | 0.85    | -0.06em  | UPPER  |
| Sector (H2)     | Archivo Black  | `clamp(2.5rem, 4vw, 5rem)`               | 900    | 0.95    | -0.04em  | UPPER  |
| Headline (H3)   | Archivo Black  | `clamp(2rem, 3vw, 3.5rem)`               | 900    | 1.1     | -0.02em  | UPPER  |
| Title           | Geist Sans     | `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)` | 600    | 1.1     | 0        | Normal |
| Body            | Geist Sans     | `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)` | 400    | 1.5     | 0        | Normal |
| Label/Eyebrow   | JetBrains Mono | 0.75rem                                  | 500    | 1.4     | 0.1em    | UPPER  |
| Micro/Telemetry | JetBrains Mono | 0.75rem                                  | 400    | 1.4     | 0.1em    | UPPER  |

### Tracking Scale

- `--tracking-tight: -0.06em` — Macro headlines
- `--tracking-tight-sm: -0.04em` — Sector / H2
- `--tracking-normal: 0` — Body
- `--tracking-wide: 0.05em` — Links, buttons
- `--tracking-wider: 0.1em` — Micro telemetry
- `--tracking-widest: 0.15em` — Dense data clusters

### Leading Scale

- `--leading-none: 0.85` — Macro
- `--leading-tight: 0.95` — Sector
- `--leading-snug: 1.1` — H2/H3
- `--leading-normal: 1.4` — Micro
- `--leading-relaxed: 1.5` — Body

### Named Rules

**The Real-Data Rule.** The mono label carries true information — `45.6306° N · 8.7281° E — VDS`, a date, an altitude, a stack, a revision — never a decorative "ABOUT" kicker. If the eyebrow doesn't say something true, it doesn't ship.

**The Semantic Element Rule.** Eyebrows use `<data>`, `<samp>`, `<kbd>` per content type — never generic `<span>`. This is machine-readable telemetry.

**The Extreme Contrast Rule.** Macro and Micro exist at opposite ends of the scale. No intermediate "display" sizes that dilute the contrast. The gap _is_ the hierarchy.

## 4. Layout & Spatial Engineering

**Blueprint Grid** — 12-column CSS Grid with 1px gap trick (`gap: var(--grid-gap)` on parent with contrasting background) generating mathematically perfect hairlines without complex borders.

### Principles

- **Visible compartmentalization**: Every zone delineated by solid hairlines (`1px` or `2px`). Horizontal rules (`<hr>`) span full container width.
- **Bimodal density**: Extreme data density (tight monospace clusters) alternating with vast negative space framing macro type.
- **Zero radius**: `--radius-none: 0`. All corners exactly 90°.
- **Grid determinism**: `display: grid; gap: 1px;` with parent/child background contrast for razor-thin dividing lines.

### Spacing

- `--space-section: clamp(8rem, 6rem + 8vw, 14rem)` — Extreme vertical rhythm between bands
- `--space-unit: 4px` — Base unit
- `--container-page: 75rem` — Max content width
- `--grid-columns: 12` — Blueprint columns
- `--grid-gap: 1px` — Visible grid lines

## 5. UI Components & Symbology

### Syntax Decoration (ASCII Framing)

- **Section eyebrows**: `[ SECTOR 01 · CHARACTER · ENTERPRISING ]` — `<data>` element
- **Ghost links**: `>>> CONTACT` — prepended on hover via `::before`
- **Card corners**: ASCII corner markers via `::before`/`::after` (top-left, bottom-right)
- **Directional**: `>>>`, `///`, `\\\\` for flow indication

### Industrial Markers

- Registration (`®`), copyright (`©`), trademark (`™`) as structural glyphs
- Crosshairs (`+`) at grid intersections
- Repeating vertical lines (barcode patterns)
- Thick horizontal warning stripes (accent red)
- Randomized technical strings: `REV 2.6`, `UNIT / D-01`, `CHKSUM A7F3`

### Buttons

- **Shape**: Zero radius (`rounded-none`)
- **Primary**: Solid hazard red (`#E61919`) with ink (`#000000`) label in tracked mono — 4.83:1, AA-safe. Reserved for **final CTA only**.
- **Border**: 2px transparent at rest; reveals ink border on hover
- **Hover**: `-translate-y-1` + ink border
- **Active**: `scale-[0.98] translate-y-[1px]` — mechanical press

### Mosaic Tile (Signature)

- **Corner Style**: Zero radius, ASCII corners
- **Background**: Band's own tone (paper on light, night on dark) at 80% opacity
- **Border**: 2px hairline at rest (`ink/10` or `phosphor/10`); turns hazard red on hover
- **Hover**: `-translate-y-2` + accent edge. No shadow.
- **Internal Padding**: 1.5rem — composed piece, not dense CMS grid

### Ghost Link

- Mono, uppercase, generous tracking (`0.1em`)
- Prepends `>>> ` on hover (opacity transition)
- Current text color (`text-current`) — tone-aware

### Navigation — Altitude Gauge (Signature)

- Fixed vertical bar (desktop) / top progress bar (mobile)
- Labels: `GROUND · CLIMB · CRUISE · DESCENT · NIGHT` in mono
- Orange marks current band; labels are smooth-scroll anchors
- Tracks flight profile (rises and falls — ADR-0010)

## 6. Textural & Post-Processing Effects

All effects respect `prefers-reduced-motion: reduce` — disabled entirely when set.

### Global Mechanical Noise

- Low-opacity SVG fractal noise overlay on `<html>` (`opacity: 0.025`)
- Unified physical grain across both light and dark modes

### Halftone / 1-Bit Dither Overlay

- CSS-only radial dot pattern (`mix-blend-mode: multiply`)
- Applied via `.halftone-overlay` / `.halftone-overlay-light` / `.halftone-overlay-dark`
- For images and large serif typography (textural juxtaposition)

### CRT Scanlines (Night Bands Only)

- `repeating-linear-gradient` simulating horizontal electron beam sweeps
- Subtle flicker animation (8s cycle) — `.scanlines` class
- Applied to night-band sections and night-only components

### Phosphor Glow

- `text-shadow` layers for macro text on night — `.phosphor-glow` class
- Simulates CRT phosphor bloom

### Vignette

- Subtle radial edge darkening — `.vignette` class
- Different for light/dark modes

## 7. Motion

**Mechanical, not springy.** Sharp easing, abrupt reveals, staggered mechanical entry.

### Easing

- `--ease-sharp: cubic-bezier(0.4, 0, 0.2, 1)` — Primary (mechanical)
- `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)` — Legacy, being phased out

### Durations

- `--duration-fast: 150ms` — Micro interactions (hover, press)
- `--duration-normal: 300ms` — Standard transitions (tile hover, border flash)
- `--duration-slow: 600ms` — Macro reveals (section entry, tonal crossfade)

### Reveal Pattern

- Staggered mechanical entry: sequential, not springy
- Reduced offset — brutalist reveals are abrupt
- `prefers-reduced-motion`: instant, no stagger

### Tonal Crossfade

- GSAP ScrollTrigger drives backdrop blend (paper ↔ night)
- Equal-legibility flip lines per transition (ADR-0012)
- Body text flips at ~4.54:1; muted text at ~1.57:1 (documented floor)
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

- **Do** keep hazard red to a small fraction of any view; let its rarity be the signal.
- **Do** make every mono eyebrow carry true data (coordinates, dates, altitude, stack, rev).
- **Do** build depth from tone, space, and 1px hairlines — atmosphere over elevation.
- **Do** pair on the contrast axis: Archivo Black macro against Geist Sans body against JetBrains Mono micro.
- **Do** give `prefers-reduced-motion` a real path: tonal shifts instant, reveals off, textures off.
- **Do** verify every text/background pair against AA at every blend instant.
- **Do** use the blueprint grid (`grid-blueprint`) for all major layouts.
- **Do** use ASCII framing (`[ ]`, `>>>`, corners) for structural decoration.

### Don't:

- **Don't** ship the **generic AI-generator look** — cream paper + humanist serif + terracotta accent.
- **Don't** use `border-radius` — ever. Corners are 90°.
- **Don't** use `box-shadow` or glassmorphism to fake depth. Use tone and space.
- **Don't** dilute red into decorative fills, or use it as small body text.
- **Don't** add a dark/light toggle. Tone follows altitude; the journey is the theme.
- **Don't** use cream (`#FBF8F2`) or olive (`#5E6B4F`) — both deprecated.
- **Don't** use Fraunces — replaced by Archivo Black.
- **Don't** mix Swiss Industrial Print with Tactical Telemetry — pick one archetype.
- **Don't** use Geist Mono for micro — replaced by JetBrains Mono.

---

**Reference ADRs**: ADR-0021 (Palette Shift), ADR-0022 (Typography Overhaul), ADR-0010 (Flight Profile), ADR-0012 (Equal-Legibility Flip Lines), ADR-0003 (Scroll Engine), ADR-0009 (A11y Floor).
