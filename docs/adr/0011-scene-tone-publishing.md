# ADR-0011: Scene-Tone Publishing (Live Text Tone for Scene Bands)

## Metadata

| Field          | Value                                  |
| -------------- | -------------------------------------- |
| **Status**     | Accepted                               |
| **Date**       | 2026-08-11                             |
| **Authors**    | AlessioBrillo                          |
| **Deciders**   | AlessioBrillo                          |
| **Relates to** | ADR-0003, ADR-0004, ADR-0008, ADR-0010 |
| **Project**    | The Ascent                             |

## Context

The tonal engine (ADR-0003) crossfades a single fixed backdrop between
`paper` and `night` as the user scrolls (flight profile, ADR-0010). Bands
inside the scene (`surface="scene"`, ADR-0010) defer their background to that
backdrop, but until now each band pinned its **text** colour to a static
per-band tone (`text-ink` / `text-ink-soft`), as if the backdrop under it never
moved.

The engine always _knew_ the live tone — it interpolates it every frame — but
never published it. Two defects followed once the backdrop spends real scroll
distance on `night` (cruise, plus both blend windows):

1. **AA failure at night.** `text-ink` (13:1 on paper) drops to roughly 1.8:1
   on the night backdrop; `text-ink-soft` (~1.6:1) is worse. Every scene band
   whose own band tone was `paper` (Hero, Who, Mosaic, SkySport, Experiences)
   rendered ink-family text on a dark backdrop for the whole cruise.
2. **Two sources of truth.** A section's effective background changed with
   scroll, but its text tone was frozen at authoring time — the legibility
   contract ("text sits on its correct, AA-legible tone", ADR-0003) was
   enforceable only by hand, per element, per band.

## Decision Drivers

1. **AA is non-negotiable** (ADR-0009): no small text on a wrong-tone backdrop,
   in either crossfade direction, under either motion preference.
2. **The engine is the authority** — it already owns the blend; components
   should read from it instead of duplicating scroll math.
3. **No regression to the blend** — publishing must not snap, stall, or
   re-paint the GSAP-owned backdrop.
4. **Explicit tones stay first-class** — night bands (AiPhysics, WorkSchool)
   pass `tone="dark"` and keep their design.

## Considered Options

### Option A: Publish the live scene tone through React context (CHOSEN)

`TonalScene` owns the scene's tone state and provides a `SceneToneContext`
(`tone` + `setTone`). The engine receives an `onToneChange` callback and
publishes flips at the points where the new tone becomes the more legible one:

- **Full motion:** at each fade's _midpoint_ (heading top at 75% of the
  viewport, the mathematical middle of `top bottom` → `top center`). At that
  point the backdrop is exactly equidistant from the two committed tones and
  the incoming tone is strictly more legible from there on; each tone's
  sub-AA stretch is bounded to half a fade instead of a whole one.
- **Reduced motion:** at the same fade-midpoint line (75% of the viewport),
  where the backdrop switches discretely — so both paths flip backdrop and
  text tone at the identical scroll position, with no blended intermediate.

Both flips are anchored as _relative_ ScrollTrigger starts (`top 75%` of the
trigger heading), which ScrollTrigger re-measures on every refresh: fonts or
images that shift the layout after mount cannot freeze the flip at
first-render geometry (an absolute pixel start does, and fires the flip late —
the defect this anchor exists to prevent).

Consumers: `Band` (`surface="scene"`) takes its text colour from the live tone
(`text-cream` on night); `Eyebrow` derives its `light`/`dark` tone from it when
no explicit tone is given; muted text (statement lines, captions, years) uses
the `SCENE_SOFT_TEXT` map (`text-ink-soft` on paper, `text-muted-dark` on
night). Outside a `TonalScene` the context defaults to `paper`, so static
contexts (case-study pages, error boundary, tests) are unchanged.

### Option B: Drive scene text from a CSS variable set by the scene

Set `--scene-tone` (or a soft-text variable) on the scene wrapper and let
utilities resolve against it. Rejected: splits the mechanism across CSS and
React, duplicates the mapping in `@theme`, and is harder to unit-test than a
typed context whose default is trivially verified.

### Option C: Per-section scroll listeners re-deriving text tones

Each scene section computes its own tone from scroll position. Rejected:
re-implements the engine's own measurement (fade windows, heading centres)
per section, multiplying the drift surface ADR-0010 removed.

## Decision

Adopt **Option A**. `TonalScene` is the single owner of the scene tone; the
engine publishes flips via `onToneChange` at the fade-midpoint (full motion)
and at the discrete switch point (reduced motion); `SceneToneContext` is the
single way scene text derives its colour. The backdrop element's paint remains
GSAP-owned: React renders only the `paper` seed and must never re-render it
from scene state (that would snap the blend).

## Consequences

- **Positive:** no ink-family text on the night backdrop anywhere in the
  flight; legibility follows the blend in both directions, under both motion
  preferences; explicit `tone` props still win where a band is deliberately
  one-tone (AiPhysics, WorkSchool); static contexts degrade to `paper`.
- **Negative:** the scene tone is a single global value, so during a blend it
  is an approximation — the backdrop is a gradient of tones but text can only
  hold one. The flip is placed at the fade midpoint, where the two tones are
  exactly equally legible, bounding each tone's sub-AA stretch to half a
  crossfade (~a few hundred px of scroll) instead of the whole window. This is
  the deliberate trade-off of a fixed backdrop and is documented in the
  engine's `FADE_MIDPOINT_START`.
- **Testing:** the contract is guarded by unit tests (Band, Eyebrow,
  ImageBlock, section-level muted tones, engine flip/discrete publish,
  TonalScene provider wiring) and by the Playwright harness, which now also
  holds text tones at both ends of each crossfade.
