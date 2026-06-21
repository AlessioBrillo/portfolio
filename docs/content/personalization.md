# Personalization & Details (the "You" Part)

Touches that make the site _recognisably yours_ without adding noise. Rule: **one
flourish per area**, never accumulate.

- **Social / OG card** — the first impression on LinkedIn/WhatsApp is the preview,
  not the site. Design it: Night background, name in Fraunces, orange thread, one
  line. Highly curated.
- **Favicon** — a small orange glyph: an abstract wing profile / an ascent arrow.
  Your minimal mark. (The scaffold ships a placeholder ascent-arrow SVG favicon in
  `index.html`.)
- **Metadata that tells the truth** — dates, VDS coordinates, altitude, stack: no
  decorative labels.
- **One easter egg**, consistent with the curious character — in the Night band,
  pressing `Up` lifts the "altitude" and a faint constellation surfaces. Just one.
  Rewards explorers, disturbs no one.
- **404 in voice** — _"Lost altitude. Let's get you back to ground."_ -> home.
  (Implemented in `src/pages/NotFoundPage.tsx`.)
- **No dark/light toggle** — a choice, not a gap (see
  [ADR-0004](../adr/0004-no-theme-toggle.md)). At most a single "reduce motion /
  static" override for accessibility.
- **CV** — excluded for now; a hidden footer hook (`Resume — on request`) can be
  activated later without rework.
