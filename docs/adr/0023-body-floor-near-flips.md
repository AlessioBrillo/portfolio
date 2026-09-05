# ADR-0023: Body Contrast Floor Near Flip Lines Under the Brutalist Palette

## Metadata

| Field          | Value                        |
| -------------- | ---------------------------- |
| **Status**     | Accepted                     |
| **Date**       | 2026-09-05                   |
| **Authors**    | AlessioBrillo                |
| **Deciders**   | AlessioBrillo                |
| **Relates to** | ADR-0009, ADR-0012, ADR-0021 |
| **Project**    | The Ascent                   |

## Context

ADR-0012 placed each text family's flip at its equal-legibility line and the
harness gated body text at WCAG AA (4.5:1) at every instant of both crossfades.
That gate was provable under the original palette: pure-black ink on pure-white
phosphor tie at 4.58:1 at the flip, so AA held through it.

Two changes since broke the proof without updating the gate:

1. ADR-0021 moved body text to ink `#050505` / phosphor `#EAEAEA`. The softer
   pair ties at ~4.06:1 at the flip — the maximin optimum (no placement on
   these segments can do better), but below 4.5.
2. The 2→4 fade migration (intermediate haze/dawn segments) moved the decisive
   flips into short windows where the same optimum applies per segment.

The engine additionally bisected against a paper/night synthesis instead of
each window's actual blend, firing flips hundreds of pixels late/early — a
rendered 2.0:1 defect, fixed alongside (true-segment bisection in
`src/lib/tone.ts`).

## Decision Drivers

1. **Honesty over aspiration** — a gate that cannot pass is not a quality
   floor, it is a broken promise (the E2E suite has been red since 2026-09-01
   proving exactly this).
2. **Keep the palette** — ADR-0021 stands; relitigating hazard-red/ink for
   0.5:1 at two instants is disproportionate.
3. **No perceptible regression** — large-text AA (3.0:1) must hold with margin
   throughout; normal-text AA must hold everywhere except the flip instants.

## Considered Options

### Option A: Floor 4.0 within ±0.08 of each body flip, 4.5 elsewhere (CHOSEN)

Equal-legibility placement stays (it minimizes the worst case by
construction). The Playwright sweep gates 4.5 at every sample except within
±0.08 of a body flip, where it gates 4.0 (proven optimum 4.06, margin 0.06).
The window covers AA recovery (~0.065 past the line) plus scroll-positioning
variance. Large-text AA holds everywhere with wide margin.

### Option B: Restore pure black/white body text

Rejected: recovers 4.58 at the flip but contradicts the accepted brutalist
substrates (ADR-0021) — ink `#050505` on newsprint and phosphor `#EAEAEA` on
CRT black are load-bearing aesthetic choices, and the gain (0.5:1 at two
instants) does not justify reopening them.

### Option C: Drop the normal-text AA claim to 3.0 throughout

Rejected: over-corrects. 4.5 genuinely holds across ~95% of the flight; only
the flip instants need the documented floor. The muted family already follows
this pattern (documented 1.57 floor, ADR-0012) — Option A extends the same
philosophy to the body family.

## Decision

Adopt **Option A**. Concretely:

- `src/lib/tone.ts` bisects each window's actual backdrop segment against the
  flight-phase text pair (climb: ink → phosphor; descent: phosphor → ink).
  True lines: mosaic body 0.085 / soft 0.165, sky-sport body 0.833 / soft
  0.760; who and experiences clamp to their edges (tone holds / starts
  flipped).
- `src/lib/tone.e2e.ts` exports `BODY_NEAR_FLIP_FLOOR = 4.0` and
  `BODY_FLIP_WINDOW = 0.08`; the sweep gates per-sample accordingly.
- The unit suite pins the mechanism (winning family each side of every line)
  and the floors instead of magic snapshots of a buggy computation.

## Consequences

- **Positive:** the signature harness can go green honestly; the worst case is
  stated, measured, and optimal — the same posture ADR-0012 took for muted.
- **Negative:** small-text AA dips to ~4.1 for a few dozen pixels around two
  flip instants (large-text AA unaffected). Accepted deliberately, here.
- **Testing:** `tone.test.ts` gates floors + mechanism; the Playwright sweep
  (`e2e/signature.e2e.ts`) gates the rendered contract per sample.
