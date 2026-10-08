# ADR-0026: Tonal Engine — Layout-Driven Scroll Handler over a Pure State Function

## Metadata

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| **Status**     | Accepted                               |
| **Date**       | 2026-10-08                             |
| **Authors**    | AlessioBrillo                          |
| **Deciders**   | AlessioBrillo                          |
| **Supersedes** | ADR-0003 (scroll & animation engine)   |
| **Relates to** | ADR-0010, ADR-0011, ADR-0012, ADR-0018 |
| **Project**    | The Ascent                             |

## Context

The signature is the backdrop crossfade that follows the flight profile
(ADR-0010): four fades, each anchored to a real section and running while that
section's heading travels from `top bottom` to `top center`. Scene text flips
tone on per-direction equal-legibility lines inside those windows (ADR-0012).

ADR-0003 drove this with GSAP ScrollTrigger. Commit `4be5e19` replaced it with
CSS `animation-timeline: scroll(root)` over hand-written keyframes, and the
Playwright signature harness has been red on `main` ever since (20 failures
across every viewport). Instrumenting the page showed the cause:

- The keyframes and the static gradient assumed eight equal 12.5% bands of the
  **whole document's** scroll, with hard steps between them. The real windows
  are per section and depend on layout: the `who` fade never showed haze, the
  mosaic jumped straight to night at 28% of the page, the descent flipped at
  fractions unrelated to the sections.
- The colours were hard-coded in CSS (`#84837f` for both haze tones) and had
  drifted from `BACKDROP_TONES`.
- The optional polyfill was imported through a variable specifier with
  `@vite-ignore`, so it could never resolve in a production build.

The same commit loosened the harness (smooth scrolling plus a helper that
issued `scrollBy` immediately after `scrollTo`, which cancels the smooth
scroll in Chromium), which hid the problem behind a different failure.

## Decision Drivers

- The fade windows are defined by layout (a heading's viewport position), not
  by a fraction of the document.
- One code path in every browser; the harness reads the backdrop's computed
  `background-color` as `rgb(...)`.
- `tone.ts` already owns the exact blend (`backdropColorAt`) and the flip lines
  (`FLIP_PROGRESS`); the engine should reuse them, not restate them.
- Reduced motion switches tone discretely at the body flip line, never blends.
- No new runtime dependency; the existing bundle budget (ADR-0018) must hold.

## Considered Options

### Option A: CSS `scroll()` keyframes (commit `4be5e19`)

Rejected. Percentages of document scroll cannot express a window anchored to a
heading's viewport position; any content or font change moves the real windows
and the keyframes silently desynchronise. It also forks the palette into CSS.

### Option B: CSS `view-timeline` per trigger driving registered custom

properties, mixed with `color-mix()`

Rejected. It is correct in principle, but (1) `background-color` is not
compositor-accelerated, so there is no performance gain over JS; (2) Chrome
serialises the computed colour as `color(srgb ...)`, which forces the contract
with the harness (and any consumer) to change; (3) Firefox and Safari need a
JS fallback anyway, so it would ship two code paths for one behaviour.

### Option C: Restore GSAP ScrollTrigger (ADR-0003)

Rejected. It works, but pays an animation dependency and an async load path
(with its own failure mode) for what is a linear interpolation between two
colours over a measurable window.

### Option D: rAF-throttled scroll handler over a pure state function (chosen)

`tonalStateAt(tops, viewportHeight, reducedMotion)` (`src/lib/tonal-state.ts`)
maps each trigger's viewport position to `{ color, tone, softTone }` using the
transitions in `flight-profile.ts`, `backdropColorAt`, and `FLIP_PROGRESS`.
`useSceneTonePublisher` reads the trigger positions on each scroll or resize
frame, writes the colour to the fixed backdrop, and publishes tone changes.

## Decision

Adopt Option D.

- The trigger element is `[data-tone-trigger]`, else the section heading, else
  the section, exactly as before. Positions are read live every frame, so late
  layout shifts (fonts, images) cannot leave stale geometry.
- Under reduced motion the backdrop and both text families switch together at
  the body flip line; no intermediate colour is ever painted.
- `flight.css` only seeds the backdrop with `--color-paper` so there is no flash
  before JS runs. Forced-colors mode keeps `Canvas`.
- The polyfill dependency, the static gradient, the keyframes, and the engine
  error toast are removed. The `tonal-engine-load` event and
  `__TONAL_ENGINE_LOADED__` flag stay, as the harness synchronises on them.

## Consequences

- **Positive:** one path in all browsers; the logic is a pure function with
  unit tests; one source of truth for colours and flip lines; one fewer
  dependency; the signature harness is green again.
- **Negative:** the colour is written from the main thread on each scroll frame
  (one `getBoundingClientRect` per trigger). The cost is four reads and one
  style write per frame, which `background-color` would pay in paint under any
  engine.
- **Test harness:** `e2e/signature.e2e.ts` is restored to its last-green
  version (instant `scrollTo`). It is not weakened; the smooth/stepped scroll
  helpers and the fallback-forcing init scripts existed only to work around the
  previous engines.
