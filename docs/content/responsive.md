# Responsive & Mobile

The ascent works well on a phone — the tonal transitions are scroll-driven, which
is the native mobile interaction.

- **Mosaic:** from grid to **1 column**, full-width tiles.
- **Altitude gauge:** collapses into a thin **top progress bar** + band label.
  Same meaning, less footprint.
  > **UX note (2026-06-22, deferred to Phase 3):** with no hamburger
  > ([ADR-0006](../adr/0006-navigation-altitude-gauge.md)), a non-interactive
  > progress bar would leave mobile users no way to jump between bands on a long
  > page. The collapsed band label must be **tappable** to reveal the stop list
  > (`ALTITUDE_STOPS`) so section jumping survives on mobile.
- **Type:** scale reduced ~15-20%; the hero stays the protagonist but fits the
  screen.
- **Touch targets >= 44px**, thumb-comfortable spacing.
- **Performance:** on mobile, parallax is minimised; tonal colour transitions are
  kept (they are light).

Breakpoints to verify: 320, 375, 768, 1024, 1440, 1920. No overflow; touch
interactions confirmed.
