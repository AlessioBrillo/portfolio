# Personalization & Details (the "You" Part)

Touches that make the site _recognisably yours_ without adding noise. Rule: **one
flourish per area**, never accumulate.

- **Social / OG card** — the first impression on LinkedIn/WhatsApp is the preview,
  not the site. Design it: Night background, name in Fraunces, orange thread, one
  line. Highly curated.
- **Favicon** — a small orange glyph: an abstract wing profile / an ascent arrow.
  Your minimal mark. (The scaffold ships a placeholder ascent-arrow SVG favicon at
  `public/favicon.svg`, linked from `index.html`.) The icon family is derived from
  that single source: `public/apple-touch-icon.png` (180x180, paper background) and
  `public/site.webmanifest` — regenerate the PNG from the SVG whenever the glyph
  changes.
- **Metadata that tells the truth** — dates, VDS coordinates, altitude, stack: no
  decorative labels.
- **One easter egg**, consistent with the curious character — in the Night band, a
  faint constellation surfaces on a deliberate gesture. Just one. Rewards explorers,
  disturbs no one.
  > **Design note (2026-06-22, deferred to its build phase):** the original idea
  > triggered this on the `Up` arrow key, which hijacks native keyboard scrolling
  > and is an accessibility regression. Use a non-scroll trigger instead (e.g. a
  > key sequence, a long-press, or a hidden hotspot) so keyboard scrolling keeps
  > working.
- **404 in voice** — _"Lost altitude. Let's get you back to ground."_ -> home.
  (Implemented in `src/pages/NotFoundPage.tsx`.)
- **No dark/light toggle** — a choice, not a gap (see
  [ADR-0004](../adr/0004-no-theme-toggle.md)). At most a single "reduce motion /
  static" override for accessibility.
- **CV** — not published as a file; the footer hook `Resume — on request` (a
  pre-filled email) is live since ADR-0014. This keeps the resume current by
  construction; a real PDF can replace the mailto later without rework.
