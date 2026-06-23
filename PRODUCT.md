# Product

## Register

brand

## Users

Three audiences arrive at one page and must each be served without a menu:

- **The recruiter** — needs rigour fast. Skims for proof of how the author thinks
  (AI & physics), and must hit depth immediately, high in the page.
- **The curious visitor** — wants to discover the person: pilot, sportsperson,
  builder. Scrolls the whole journey and rewards exploration.
- **The prospective client** — needs credibility and taste at a glance; the craft
  of the page itself is the argument.

Context: mostly desktop and mobile, often reached from a LinkedIn link, so the
first impression is frequently the OG preview, then the hero within ~2 seconds.

## Product Purpose

A single-page, scroll-driven personal portfolio ("The Ascent") for Alessio Brillo
— student of AI and physics, ultralight pilot (VDS), sportsperson, builder. The
repository is itself part of the portfolio: code and docs are meant to read as
carefully as the site. Success = a recruiter reaches the serious work and trusts
it within seconds, while a curious visitor is pulled all the way down the journey.

The signature device: **scrolling flies a flight profile.** The background tone
crossfades through bands — ground (paper/day) → climb → cruise (night, above the
cloud deck) → descent (back to daylight) → night landing. Light and dark are the
journey, not a toggle (see `docs/adr/`, esp. ADR-0001, ADR-0004, ADR-0010).

## Brand Personality

- **Three words:** enterprising, adventurous, curious.
- **Voice:** active, sober, specific. Show, never sell — "I trained a transformer
  on an Italian-language corpus" beats "passionate AI enthusiast." Adjectives are
  earned by evidence, not asserted.
- **Emotional goal:** quiet confidence and altitude. The feeling of a disciplined
  craftsperson who also flies — calm, exact, with one breathtaking moment (the
  tonal ascent) that is motivated by the author's real story, never decorative.
- **Restraint as luxury:** Apple / Loro Piana discipline. One accent (orange), one
  scenographic effect (the tonal transition), generous space. Everything else is
  quiet so the one loud thing tells the story.

## Anti-references

- **The generic AI-generator look** — cream background + humanist serif +
  terracotta accent, the "Anthropic-clone" aesthetic any generator now produces.
  The night band is deliberately blue-black (`#14161D`), not the default
  brown-black, to step away from this.
- **Stock portfolio template** — uniform project-card grids, identical tiles, no
  hierarchy, no editorial voice. The mosaic must read as composed pieces under one
  roof, not a CMS grid.
- Also out (already precluded by the docs): the **template SaaS hero** (big-number
  metric + gradient blob + generic CTA — the hero is name + manifesto, no big
  number) and **dark-mode-by-default dashboards** (there is no theme toggle; tone
  follows altitude).

## Design Principles

1. **The repo is the portfolio.** Code quality, docs, and ADRs are first-class
   craft, not scaffolding — they are evidence of how the author works.
2. **One risk, justified.** The flight-driven tonal ascent is the only scenographic
   move; it earns its loudness by being the thing that actually tells the story.
   Everything else stays disciplined and quiet.
3. **Show, don't tell.** Specificity over adjectives — real coordinates, real
   stacks, real outcomes. Metadata carries truth (dates, VDS coordinates, altitude).
4. **Orange is the heartbeat, never the wallpaper.** A single accent that is never
   diluted; the one place it is purely functional is marking position on the gauge.
5. **Depth on demand.** Curated on the surface, deep when you dig — case studies
   open into long, shareable routes for those who want the full story.

## Accessibility & Inclusion

- **WCAG 2.1 AA** is the floor (ADR-0009). Ink-on-paper and cream-on-night pass
  comfortably; orange is an accent for large text/details, never small body copy —
  every pairing is checked against AA.
- **Reduced motion is a first-class path,** not an afterthought: with
  `prefers-reduced-motion: reduce`, tonal transitions become instant and
  reveals/parallax are disabled (the journey still reads, just without animation).
- **Keyboard:** the mosaic and altitude gauge are operable from the keyboard with a
  visible orange focus ring; heading order is correct; images carry real `alt`.
- **Performance is accessibility:** self-hosted subset fonts, AVIF/WebP lazy media,
  minimal scroll JS; targets LCP < 2.5s and ~0 layout shift.
