# ADR-0012: Equal-Legibility Flip Lines for Scene Text Tone

## Metadata

| Field          | Value                                                                            |
| -------------- | -------------------------------------------------------------------------------- |
| **Status**     | Accepted                                                                         |
| **Date**       | 2026-08-13                                                                       |
| **Authors**    | AlessioBrillo                                                                    |
| **Deciders**   | AlessioBrillo                                                                    |
| **Relates to** | ADR-0003, ADR-0004, ADR-0008, ADR-0009, ADR-0010, ADR-0011                       |
| **Supersedes** | ADR-0011 (flip placement and explicit-tone clauses), ADR-0008 (ink/cream values) |
| **Project**    | The Ascent                                                                       |

## Context

ADR-0011 publishes the scene text tone at each fade's _midpoint_ (heading top
at 75% of the viewport). The midpoint is the mathematical middle of the fade
window, but it is **not** the point where the two text tones are equally
legible against the live backdrop — the ink family (luminance ≈ 0) has far
more contrast headroom than the cream family (luminance ≈ 0.98). The residual
AA defect at the fade midpoint, with the old palette:

| Pair                        | Outgoing tone vs midpoint backdrop | Incoming tone vs midpoint backdrop |
| --------------------------- | ---------------------------------- | ---------------------------------- |
| Body (ink/cream)            | 5.55 : 1                           | **3.57 : 1** (below AA)            |
| Muted (ink-soft/muted-dark) | 2.53 : 1                           | **1.03 : 1** (near-invisible)      |

The 1.03 : 1 figure is the worst moment in the whole flight: at the midpoint
the backdrop's luminance happens to sit almost exactly between the two muted
luminances, so the incoming muted tone is invisible against it. The midpoint
also leaves the incoming tone's sub-AA stretch at its worst (half a fade of
the _minimum_ contrast instead of half a fade of a bounded one).

## Decision Drivers

1. **AA is non-negotiable** (ADR-0009) — for the body family (headings, body
   copy, card titles) at **every instant** of both crossfades, in both
   directions, under both motion preferences.
2. **The engine is the authority** — it already owns the blend; components
   read from it (ADR-0011 unchanged on this axis).
3. **No regression to the blend** — the backdrop remains GSAP-owned and
   untouched by React.
4. **Palette micro-tuning is allowed where identity survives** — the ink and
   cream swatches may move within the warm paper family; the orange accent is
   never diluted (ADR-0008).
5. **The muted hierarchy is real** — muted text is muted on purpose; forcing
   it to AA would collapse the hero/body/muted hierarchy.

## Considered Options

### Option A: Equal-legibility flip lines + AA-tuned body palette (CHOSEN)

Two flip lines, each computed by bisection over the **actual** GSAP-blended
backdrop colours (linear interpolation in sRGB channels, exactly what GSAP
paints every frame):

- `BODY_FLIP_LINE` — blend fraction **0.5645** (`top 71.775%` of the trigger
  heading): the point where ink and cream are equally legible against the
  live backdrop, at **4.54 : 1**. Beyond it the incoming tone is strictly
  more legible. A sweep over both crossfades in 0.01 steps shows the body
  family ≥ **4.57 : 1** everywhere (worst case is at the flip line itself).
- `SOFT_FLIP_LINE` — blend fraction **0.6521** (`top 67.395%`): the
  equal-legibility point of the muted pair, at **1.57 : 1** — a bounded,
  documented floor that strictly improves the midpoint's 1.03 : 1.

The palette is retuned so the body flip line itself clears AA:

| Token           | Before    | After     | Luminance before | Luminance after |
| --------------- | --------- | --------- | ---------------- | --------------- |
| `--color-ink`   | `#2A2722` | `#000000` | 0.0206           | 0               |
| `--color-cream` | `#FBF8F2` | `#FFFDF6` | 0.9405           | 0.9817          |

Committed-surface contrasts are unchanged in spirit and still strong: ink on
paper 18.3 : 1, cream on night 17.8 : 1, ink on cream-tile 20.6 : 1 (mosaic
thumbnails stay legible on both tones). The muted pair (`ink-soft` /
`muted-dark`) is untouched.

Under reduced motion there is no blend: backdrop and **both** text families
switch together at the body flip line. Splitting the lines there would strand
the muted family on the wrong committed tone between 0.5645 and 0.6521 (there
is no backdrop gradient to equalise against). Co-located, the committed muted
contrasts are 8.2 : 1 (ink-soft on paper) and 4.7 : 1 (muted-dark on night).

### Option B: Keep the midpoint for the muted family

Rejected: that is precisely the 1.03 : 1 near-invisible moment this ADR
removes.

### Option C: Tune the muted pair to clear AA at its flip line

Rejected: the muted pair is luminance-close by design — it is the
_hierarchy_, not a defect. Pushing it to ≥ 2.2 : 1 at the line would require
moving `muted-dark` up into the body family's luminance band, erasing the
visual step between body copy and captions/years (ADR-0008's role system).

## Decision

Adopt **Option A**.

- The engine creates three ScrollTriggers per transition under full motion:
  the backdrop crossfade (unchanged), the **body** flip at `BODY_FLIP_LINE`
  (publishes `tone`), and the **muted** flip at `SOFT_FLIP_LINE` (publishes
  `softTone`). Under reduced motion it creates one: the discrete backdrop
  switch at `BODY_FLIP_LINE`, publishing **both** tones.
- `SceneToneContext` carries a second value, `softTone` (+ `setSoftTone`);
  `TonalScene` seeds it on `paper`, `ToneProvider` seeds it from
  `initialTone`. Muted consumers (`Eyebrow`, `EntryCard` meta, statement
  lines, captions, years) read `softTone` instead of `tone`.
- The scene bands AiPhysics and WorkSchool drop their explicit `night`
  tones: with the backdrop uniform, every body-family element in the
  viewport is ≥ 4.5 : 1 at every instant, so no scene band needs a pinned
  text tone. This supersedes ADR-0011's "explicit tones stay first-class"
  driver: in the scene, the flight owns the tone. Solid-surface `tone` props
  (used by the same sections in static contexts) are untouched.
- The flip positions are computed once, at module load, by bisection
  (`flipLineFor` in `src/lib/tone.ts`) — no magic constants drift between
  the engine and its tests. The Playwright harness mirrors the constants for
  its own sweep.

## Consequences

- **Positive:** body-family text is ≥ 4.5 : 1 at every blend instant, both
  directions, both motion preferences — verified by a unit sweep (every
  0.01 of both fades) and an e2e sweep in the browser; the muted worst case
  improves 1.03 : 1 → 1.57 : 1 and is bounded by a documented floor; the
  scene's text tone animates with the backdrop exactly where legibility
  flips, not at a geometric convenience.
- **Negative:** two flip lines mean three ScrollTriggers per transition
  (full motion) instead of two; the muted family's 1.57 : 1 floor is
  documented, not hidden — it is the mathematical best the pair can do
  without losing the hierarchy. ADR-0008's ink/cream values are superseded
  (the swatches stay in the paper family; the orange accent is untouched).
- **Testing:** the equal-legibility property, the AA sweep, the muted floor,
  and the reduced-motion co-location are unit-gated in `tone.test.ts`; the
  engine test asserts the new trigger set; the Playwright harness sweeps
  both crossfades around both flip lines and gates headings ≥ 4.5 : 1 and
  muted text ≥ 1.5 : 1.
