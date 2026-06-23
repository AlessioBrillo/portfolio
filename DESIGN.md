---
name: The Ascent
description: A single-page, scroll-driven portfolio where scrolling flies a flight profile and light/dark is the journey.
colors:
  orange: '#E9622E'
  paper: '#F4EFE6'
  night: '#14161D'
  olive: '#5E6B4F'
  ink: '#2A2722'
  cream: '#FBF8F2'
  muted-light: '#8A8377'
  muted-dark: '#7B8190'
typography:
  display:
    fontFamily: 'Fraunces, ui-serif, Georgia, serif'
    fontSize: 'clamp(3rem, 1rem + 7vw, 6rem)'
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Fraunces, ui-serif, Georgia, serif'
    fontSize: 'clamp(2.25rem, 1.5rem + 2.5vw, 3.5rem)'
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: '-0.01em'
  title:
    fontFamily: 'Geist Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.375rem, 1.2rem + 0.6vw, 1.625rem)'
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 'normal'
  body:
    fontFamily: 'Geist Sans, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)'
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 'normal'
  label:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
    fontSize: '0.8125rem'
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: '0.18em'
rounded:
  soft: '8px'
  card: '12px'
spacing:
  hairline: '1px'
  section: 'clamp(6rem, 4rem + 6vw, 10rem)'
components:
  button-primary:
    backgroundColor: '{colors.orange}'
    textColor: '{colors.ink}'
    typography: '{typography.label}'
    rounded: '{rounded.soft}'
    padding: '14px 28px'
  button-primary-hover:
    backgroundColor: '{colors.orange}'
    textColor: '{colors.ink}'
  eyebrow:
    textColor: '{colors.muted-light}'
    typography: '{typography.label}'
  mosaic-tile:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.card}'
    padding: '28px'
---

# Design System: The Ascent

## 1. Overview

**Creative North Star: "The Quiet Cockpit"**

A cockpit at altitude is the whole system in one image: matte, disciplined
surfaces; precise mono-spaced instruments reading real data; one warm signal light;
and, beyond the glass, a sky that changes from day to night as you climb. The
interface is calm and exact almost everywhere, so the one scenographic thing — the
tonal flight that the background performs as you scroll — lands like a view, not a
gimmick. This is Apple / Loro Piana restraint applied to a personal story: the
luxury is space and precision, not ornament.

The system rejects two things explicitly. It is **not the generic AI-generator
look** — the cream-paper-plus-humanist-serif-plus-terracotta aesthetic any
generator now produces; the dark band is a deliberate blue-black (`#14161D`), never
the default brown-black, precisely to step off that worn path. And it is **not a
stock portfolio template** — no uniform card grid of identical tiles. The mosaic is
a composed set of pieces under one roof, with hierarchy and editorial voice.

Depth comes from tone and atmosphere, not from drop shadows and glass. Layering is
achieved by the background tone shifting beneath fixed content, by generous
vertical rhythm, and by hairline rules — not by elevation cards stacked on cards.

**Key Characteristics:**

- One accent (orange), one scenographic effect (the tonal flight), everything else quiet.
- Mono type carries _real_ data — coordinates, dates, altitude, stack — never decoration.
- Editorial scale contrast: a large humanist serif against a precise grotesque body.
- Atmosphere over elevation: depth from tonal layering and space, not shadows.
- AA-or-better contrast is a hard floor; reduced motion is a first-class path.

## 2. Colors

A warm, tailored daylight palette that flies up into a cool blue-black night, with a single warm accent threading the whole climb.

### Primary

- **Signal Orange** (`#E9622E`): The sole accent and the heartbeat of the page —
  links, the final CTA, hover edges on tiles, and the one functional use: marking
  the current position on the altitude gauge. It is never diluted into decorative
  fills or used as small body text.

### Secondary

- **Field Olive** (`#5E6B4F`): A muted natural green used **rarely** — only in the
  outdoor/sport material (aviation, MTB, tennis). It breathes alongside orange in
  the descent band; it never competes with it elsewhere.

### Neutral

- **Tailored Paper** (`#F4EFE6`): Background of the light bands (ground, descent) —
  warm and sartorial, the daylight surface.
- **Cruise Night** (`#14161D`): Background of the dark bands (cruise, night
  landing). A blue-black sky above the cloud deck — deliberately _not_ brown.
- **Cartographer's Ink** (`#2A2722`): Body text on Paper; also the label color on
  the orange button (contrast: 4.42:1 vs orange).
- **Instrument Cream** (`#FBF8F2`): Text and light surfaces on Night.
- **Day Muted** (`#8A8377`): Captions and metadata on light bands.
- **Night Muted** (`#7B8190`): Captions and metadata on dark bands.

### Named Rules

**The Single Voice Rule.** Orange appears on a small fraction of any screen and is
never diluted. Its rarity is the signal. If orange is doing decoration, remove it.

**The Blue-Black Rule.** The dark surface is `#14161D` (a cool blue-black sky),
never a warm brown-black. The warm-brown night is the AI-generator tell this system
exists to avoid.

## 3. Typography

**Display Font:** Fraunces (with `ui-serif, Georgia, serif`)
**Body Font:** Geist Sans (with `ui-sans-serif, system-ui, sans-serif`)
**Label/Mono Font:** Geist Mono (with `ui-monospace, monospace`)

**Character:** A humanist serif with soft optics and real warmth (Fraunces, with
its optical-size axis live) set against a neutral modern grotesque (Geist) — a true
contrast-axis pairing, serif against sans, never two similar sans. Geist Mono adds
the technical, dev/cockpit register. Deliberately _not_ Playfair, _not_ Inter.

### Hierarchy

- **Display** (Fraunces, 500, `clamp(3rem, 1rem + 7vw, 6rem)`, line-height 1.02,
  tracking -0.02em): the hero name and nothing else at this scale. Optical sizing is
  on, so the large cut tightens naturally; `text-wrap: balance`.
- **Headline** (Fraunces, 500, `clamp(2.25rem, 1.5rem + 2.5vw, 3.5rem)`, 1.1):
  section titles (H2). One per band.
- **Title** (Geist Sans, 600, `clamp(1.375rem, 1.2rem + 0.6vw, 1.625rem)`, 1.3):
  sub-headings, mosaic tile titles, case-study sub-heads.
- **Body** (Geist Sans, 400, `clamp(1.0625rem, 1rem + 0.25vw, 1.1875rem)`, 1.6):
  prose. Cap measure at 65–75ch (`max-w-3xl` ≈ 65ch).
- **Label** (Geist Mono, 500, 0.8125rem, tracking 0.18em, UPPERCASE): the eyebrow.

### Named Rules

**The Real-Data Rule.** The mono label carries true information — `45.6306° N ·
8.7281° E — VDS`, a date, an altitude, a stack — never a decorative "ABOUT" kicker.
If the eyebrow doesn't say something true, it doesn't ship.

## 4. Elevation

This system is **flat by tone, not by shadow.** There is no ambient drop-shadow
vocabulary. Depth is built three ways: (1) the background tone crossfading beneath
fixed content as you fly the profile; (2) generous section rhythm
(`--space-section`, `clamp(6rem, 4rem + 6vw, 10rem)`) that lets bands breathe; and
(3) 1px hairline rules in the muted neutrals to separate without shouting.

### Named Rules

**The No-Shadow Rule.** Surfaces are flat at rest. Tiles lift on hover with a small
`translateY` and an orange hairline edge — a response to state, not a resting
elevation. If you reach for `box-shadow` to create hierarchy, use space or tone
instead.

## 5. Components

### Buttons

- **Shape:** softly rounded (8px, `--radius-soft`).
- **Primary:** solid Signal Orange (`#E9622E`) with a Cartographer's Ink (`#2A2722`)
  label in tracked mono — 4.42:1, AA-safe. Reserved for the **final CTA only**.
- **Hover / Focus:** a small lift (`translateY(-2px)`) and slight darken on press;
  focus shows the 2px orange ring with 2px offset.

### Mosaic tile (signature)

- **Corner Style:** 12px (`--radius-card`).
- **Background:** the band's own tone (Paper on light bands, Night on dark).
- **Border:** 1px hairline at rest; turns Signal Orange on hover for tiles that link
  to a case study.
- **Hover:** micro-lift (`translateY`), orange edge. No shadow.
- **Internal Padding:** generous (~28px), so tiles read as composed pieces, not a
  dense CMS grid.

### Ghost link

- The standard link: Ink/Cream text with an orange underline that _draws in from the
  left_ on hover (animated `::after` scale-x). The accent enters on interaction.

### Inputs / Fields

- Minimal hairline-stroked fields on Paper; focus shifts to the 2px orange ring.
  (Not heavily used yet; forms arrive with Contact.)

### Navigation — the Altitude Gauge (signature)

- A thin fixed vertical bar on the right (desktop), labelled in mono `GROUND ·
CLIMB · CRUISE · DESCENT · NIGHT`, tracking the **flight profile** (it rises and
  falls — see ADR-0010). Orange marks the current band; labels are smooth-scroll
  anchors. No hamburger, no classic menu. On mobile it collapses to a thin top
  progress bar plus a _tappable_ band label.

## 6. Do's and Don'ts

### Do:

- **Do** keep orange to a small fraction of any view; let its rarity be the signal.
- **Do** make every mono eyebrow carry true data (coordinates, dates, altitude, stack).
- **Do** build depth from tone, space, and 1px hairlines — atmosphere over elevation.
- **Do** pair on the contrast axis: Fraunces serif against Geist grotesque.
- **Do** give `prefers-reduced-motion` a real path: tonal shifts become instant, reveals off.
- **Do** verify every text/background pair against AA; bump toward ink if it's even close.

### Don't:

- **Don't** ship the **generic AI-generator look** — cream paper + humanist serif +
  terracotta accent. The blue-black night exists to avoid exactly this.
- **Don't** ship a **stock portfolio template** — uniform identical-tile card grids
  with no hierarchy or voice.
- **Don't** build the template SaaS hero (big-number metric + gradient blob + generic
  CTA). The hero is a name + a one-line manifesto.
- **Don't** add a dark/light toggle. Tone follows altitude; the journey is the theme.
- **Don't** dilute orange into decorative fills, or use it as small body text.
- **Don't** use `box-shadow` or glassmorphism to fake depth. Use tone and space.
- **Don't** use cream text on the orange button (3.14:1, fails AA). Use ink.
