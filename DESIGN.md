---
name: The Ascent
description: A single-page, scroll-driven portfolio where scrolling flies a flight profile — paper to night and back — rendered in Swiss Industrial Print.
colors:
  accent: '#E61919'
  accent-hover: '#CC1414'
  paper: '#F4F4F0'
  paper-elevated: '#FFFFFF'
  ink: '#050505'
  ink-soft: '#48453F'
  hairline-light: '#0000001A'
  night: '#0A0A0A'
  night-elevated: '#121212'
  phosphor: '#EAEAEA'
  phosphor-dim: '#8D8D8D'
  hairline-dark: '#FFFFFF1A'
  foschia: '#7A7A7A'
  alba: '#858585'
typography:
  display:
    fontFamily: 'Archivo Black, Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(4rem, 10vw, 15rem)'
    fontWeight: 900
    lineHeight: 0.85
    letterSpacing: '-0.06em'
    textTransform: 'uppercase'
  headline:
    fontFamily: 'Archivo Black, Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.5rem, 4vw, 5rem)'
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: '-0.04em'
    textTransform: 'uppercase'
  title:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: 'normal'
    textTransform: 'none'
  body:
    fontFamily: 'Archivo, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)'
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 'normal'
    textTransform: 'none'
  label:
    fontFamily: "'JetBrains Mono', ui-monospace, monospace"
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: '0.1em'
    textTransform: 'uppercase'
rounded:
  sm: '4px'
  md: '8px'
  lg: '12px'
spacing:
  section: 'clamp(8rem, 6rem + 8vw, 14rem)'
  unit: '4px'
components:
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '0'
    padding: '1rem 2rem'
  button-primary-hover:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.ink}'
  eyebrow:
    textColor: '{colors.ink-soft}'
    typography: '{typography.label}'
  mosaic-tile:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '0'
    padding: '1.5rem'
  ghost-link:
    textColor: 'currentColor'
    typography: '{typography.label}'
---

# Design System: The Ascent

## 1. Overview

**Creative North Star: "The Night Flight Deck"**

A flight deck at altitude is the whole system in one image: matte newsprint and deactivated-CRT surfaces, mono-spaced instruments reading real data, one hazard-red signal light, and beyond the glass a sky that runs paper → night → paper → night as you scroll (ADR-0010). The interface is calm and exact almost everywhere, so the one scenographic thing — the GSAP ScrollTrigger tonal flight (ADR-0003) — lands like a view, not a gimmick.

This system explicitly rejects the generic AI-generator look (cream paper + humanist serif + terracotta accent), the stock portfolio template (uniform identical-tile card grids with no hierarchy), the template SaaS hero (big-number metric + gradient blob + generic CTA), and dark-mode-by-default dashboards (there is no theme toggle; tone follows altitude). It also rejects the Italian Warmth lane it superseded (ADR-0021): warm carta, blue-black notte, terracotta orange, olive second accent, editorial serif display.

**Key Characteristics:**

- One accent (hazard red), one scenographic effect (the tonal flight), everything else quiet.
- Extreme macro/micro contrast: Archivo Black uppercase mass against JetBrains Mono telemetry.
- Mono type carries real data — coordinates, dates, altitude, stack — never decoration.
- Atmosphere over elevation: depth from tone, space, and 1px hairlines, never shadows.
- AA-or-better body contrast at every blend instant (ADR-0012); reduced motion is a first-class path (ADR-0009).

## 2. Colors

A single-archetype Swiss Industrial Print palette (ADR-0021): matte newsprint day, deactivated-CRT night, one hazard red. No second accent.

### Primary

- **Hazard Red** (#E61919): the sole accent. Final CTA fill, gauge position marker, focus ring, selection, tile hover edge. Hover deepens to #CC1414. Never diluted, never a body-text color.

### Neutral

- **Newsprint** (#F4F4F0): light substrate (ground). Body background via `--color-paper`.
- **Paper Elevated** (#FFFFFF): cards and modals on paper.
- **Carbon Ink** (#050505): primary text on paper.
- **Ink Soft** (#48453F): muted text on paper (body family clears AA at every flip line).
- **Structural Hairline, Light** (#0000001A): 1px blueprint grid lines and band borders on paper.
- **Deactivated CRT** (#0A0A0A): dark substrate (cruise, landing). Deeper than pure black, never blue-tinted.
- **Night Elevated** (#121212): cards and modals on night.
- **White Phosphor** (#EAEAEA): primary text on night, never pure white.
- **Phosphor Dim** (#8D8D8D): muted text on night (documented floor ~1.57:1 at the soft flip line).
- **Structural Hairline, Dark** (#FFFFFF1A): grid lines and band borders on night.
- **Foschia** (#7A7A7A): climb intermediate backdrop (paper → foschia → night).
- **Alba** (#858585): descent intermediate backdrop (night → alba → paper).

### Named Rules

**The Single Accent Rule.** Red appears on a small fraction of any view; its rarity is the signal. If red is doing decoration, remove it. There is no olive, no second accent.

**The True Substrate Rule.** Paper is `#F4F4F0` (matte newsprint), never warm carta (`#F4EFE6`). Night is `#0A0A0A` (deactivated CRT), never blue-black (`#14161D`).

**The Phosphor Rule.** Text on night is `#EAEAEA`, never pure white (`#FFFFFF`). Flip lines (ADR-0012) are computed against these exact values.

## 3. Typography

**Display Font:** Archivo Black (with Archivo Black fallback stack, `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Archivo (with `ui-sans-serif, system-ui, sans-serif`)
**Label/Mono Font:** JetBrains Mono (with `ui-monospace, monospace`)

**Character:** Industrial mass against instrument precision. Macro is heavy, uppercase, tightly tracked and compressed; micro is fixed-size, uppercase, widely tracked telemetry. All three families are self-hosted variable WOFF2 with `font-display: optional`.

### Hierarchy

- **Display** (900, `clamp(4rem, 10vw, 15rem)`, 0.85): hero name only. Uppercase, `-0.06em`. One idea per viewport.
- **Headline** (900, `clamp(2.5rem, 4vw, 5rem)`, 0.95): sector H2, one per band. Uppercase, `-0.04em`.
- **Title** (600, `clamp(1.25rem, 1.1rem + 0.5vw, 1.5rem)`, 1.1): sub-heads and mosaic tile titles. Sentence case.
- **Body** (400, `clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)`, 1.5): prose and UI. Cap measure at 65–75ch.
- **Label** (500, 0.75rem fixed, 1.4, `0.1em`, uppercase): eyebrows, buttons, gauge stops, ghost links. Micro telemetry never scales fluidly.

### Named Rules

**The Real-Data Rule.** The mono label carries true information — `45.6306° N · 8.7281° E — VDS`, a date, an altitude, a stack, a revision — never a decorative kicker. If the eyebrow does not say something true, it does not ship.

**The Semantic Element Rule.** Eyebrows use `<data>`, `<samp>`, `<kbd>` per content type — never generic `<span>`. Telemetry is machine-readable.

**The Uppercase Macro Rule.** Display and headline are always uppercase; body and titles never are. Uppercase outside macro/micro is forbidden.

## 4. Elevation

Flat by default, flat on hover. This system uses no shadows anywhere — depth comes from tonal layering (paper/night surfaces at 80% over the live backdrop), vast vertical space (`--space-section`), and 1px structural hairlines. Night bands add analog texture (mechanical grain, CRT scanlines with an 8s flicker, halftone/dither on imagery); all textures disable under `prefers-reduced-motion: reduce` and `forced-colors: active`.

### Named Rules

**The No-Shadow Rule.** Surfaces are flat at rest. Tiles lift on hover with `-translate-y-2` and a hazard-red hairline edge — a response to state, not a resting elevation. If a shadow ships, it is a bug.

## 5. Components

### Buttons

- **Shape:** sharp corners (0 radius), `1rem 2rem` padding.
- **Primary:** solid hazard red (`#E61919`) with carbon-ink mono uppercase label — the final CTA only.
- **Hover / Focus:** 2px ink border reveals, `-translate-y-1`; active presses to `scale(0.98)`. Visible accent focus ring (2px, offset 2px). Motion: 150ms `cubic-bezier(0.4, 0, 0.2, 1)`.

### Eyebrow

- **Style:** JetBrains Mono, 0.75rem, uppercase, `0.15em` tracking, ASCII-framed (`[ … ]`).
- **State:** tone-aware — `ink-soft` on paper, `phosphor-dim` on night — flipping at the muted equal-legibility line (ADR-0011, ADR-0012) so it stays legible mid-blend.

### Cards / Containers

- **Corner Style:** sharp (0 radius) with ASCII corner markers (`ascii-corners`).
- **Background:** the band's own tone at 80% (`paper/80`, `night/80`) over the live backdrop.
- **Shadow Strategy:** none (see Elevation).
- **Border:** 2px hairline at rest (`ink/10`, `panna/10`); hazard red on hover for linked tiles.
- **Internal Padding:** 1.5rem. Composed pieces under one roof, never a dense CMS grid.

### Inputs / Fields

No text inputs ship in this system. If a field is ever added, it takes the card treatment: sharp corners, 2px hairline stroke, mono label, accent focus ring — no filled backgrounds, no inner shadows.

### Navigation

- **Altitude gauge (signature):** fixed vertical instrument on desktop (mono stops `GROUND · CLIMB · MOSAIC · CRUISE · OPS LOG · DESCENT · ARCHIVE · NIGHT`, hazard-red position square, altitude fill rising and falling with the flight profile — ADR-0010), top progress bar with blueprint ticks on mobile. Stops are smooth-scroll anchors (instant under reduced motion), keyboard-operable, `aria-current="step"`.
- **Ghost link (standard link):** JetBrains Mono, uppercase, `0.1em`, tone-aware `text-current`; prepends `>>> ` on hover (opacity transition); hover tints accent.

### Band / Section Header (structural)

- **Band:** one tonal band per flight phase; `solid` paints its own paper/night surface, `scene` stays transparent over the `TonalScene` crossfade and reads the live scene tone for text (ADR-0011). Full-width `2px` hairline top/bottom, `clamp(8rem, 6rem + 8vw, 14rem)` vertical rhythm, 12-column blueprint grid inside.
- **Section header:** ASCII-framed `<data>` eyebrow, Archivo Black H2 (`text-sector`, `text-wrap: balance`), full-width structural rule, mono micro intro. Zero decoration, pure hierarchy.

## 6. Do's and Don'ts

### Do:

- **Do** keep hazard red to a small fraction of any view; let its rarity be the signal.
- **Do** make every mono eyebrow carry true data (coordinates, dates, altitude, stack, rev).
- **Do** build depth from tone, space, and 1px hairlines — atmosphere over elevation.
- **Do** pair on the contrast axis: Archivo Black macro against Archivo body against JetBrains Mono micro.
- **Do** give `prefers-reduced-motion` a real path: tonal shifts instant, reveals off, textures off.
- **Do** verify every text/background pair against AA at every blend instant (ADR-0012).
- **Do** use the blueprint grid (`grid-blueprint`) for all major layouts.
- **Do** use ASCII framing (`[ ]`, `>>>`, corners) for structural decoration.
- **Do** render macro display uppercase — mass and instrument precision are the voice.

### Don't:

- **Don't** ship the generic AI-generator look — cream background + humanist serif + terracotta accent.
- **Don't** ship a stock portfolio template — uniform project-card grids, identical tiles, no hierarchy, no editorial voice.
- **Don't** build the template SaaS hero (big-number metric + gradient blob + generic CTA — the hero is name + manifesto, no big number).
- **Don't** add a dark/light toggle. Tone follows altitude; the journey is the theme (there is no theme toggle).
- **Don't** ship the superseded Italian Warmth lane — warm carta, blue-black notte, terracotta orange, olive accent, Fraunces serif display.
- **Don't** use `border-radius` above 0 on buttons, tiles, or gauge markers — components are sharp; the 4–12px scale is reserved, not applied.
- **Don't** use `box-shadow` or glassmorphism to fake depth. Use tone and space.
- **Don't** dilute red into decorative fills, or use it as small body text.
- **Don't** use pure white (`#FFFFFF`) for text on night — use phosphor (`#EAEAEA`).
- **Don't** use Archivo or JetBrains Mono outside their roles — macro is Black, micro is Mono, never swapped.
- **Don't** mix Swiss Industrial Print with Italian Warmth — one archetype (ADR-0021).
