# Personalization & Details (the "You" Part)

Touches that make the site _recognisably yours_ without adding noise. Rule: **one
flourish per area**, never accumulate.

- **Social / OG card** — the first impression on LinkedIn/WhatsApp is the preview,
  not the site. Night background, name in Archivo Black, hazard-red ascent mark,
  one line. Generated from `docs/design/og-image.svg` with `npm run og`.
- **Favicon** — a small hazard-red ascent arrow. `public/favicon.svg` is the
  single source; `public/apple-touch-icon.png` (180x180, paper background) and
  `public/site.webmanifest` derive from it. Regenerate the PNG with `npm run icon`
  whenever the glyph or palette changes.
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
- **CV** — a slot, not a file yet (ADR-0028). To publish it: copy the PDF to
  `public/cv/alessio-brillo-cv.pdf`, then set `RESUME_PDF` in `src/lib/site.ts`
  to `'/cv/alessio-brillo-cv.pdf'`. The footer switches from "Resume — on
  request" to "Resume — PDF" and `npm test` fails if the path points at nothing.
  Until then the pre-filled mailto stays live (ADR-0014).
