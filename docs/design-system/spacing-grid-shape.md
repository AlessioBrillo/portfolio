# Spacing, Grid & Shape

## Spacing

A 4px scale (4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128). Bands breathe:
generous vertical padding (96-160px) is the Apple / Loro Piana "luxury". The
section rhythm is tokenised as `--space-section`
(`clamp(6rem, 4rem + 6vw, 10rem)`) in `src/styles/tokens.css`.

## Grid

12 columns, content max-width ~1200px, wide side margins. The shared `Band`
wrapper centres content in a `max-w-[1200px]` container.

## Shape

- **Radii:** soft but contained — `--radius-soft` (8px) for controls,
  `--radius-card` (12px) for surfaces. No broadsheet corners, no bloated bubbles.
- **Borders:** 1px hairlines in the neutrals to separate without shouting
  (`--hairline`).
