# ADR-0010: Flight-Profile Tonal Bands (Reframing the Ascent)

## Metadata

| Field          | Value                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| **Status**     | Accepted                                                                                 |
| **Date**       | 2026-06-22                                                                               |
| **Authors**    | AlessioBrillo                                                                            |
| **Deciders**   | AlessioBrillo                                                                            |
| **Supersedes** | Supersedes-in-part ADR-0001, ADR-0006 (band naming and the monotonic-climb framing only) |
| **Relates to** | ADR-0001, ADR-0003, ADR-0006, ADR-0008                                                   |
| **Project**    | The Ascent                                                                               |

## Context

ADR-0001 framed the journey as a single, monotonic climb — `GROUND -> HAZE ->
CLEAR -> ALTITUDE -> NIGHT`, with an altitude gauge that "fills as you climb"
(ADR-0006). The same brief also required **intermittent** light/dark "without a
switch". These two framings are in tension: the on-page tone sequence is

```
hero    who     mosaic   ai-physics  work-school  sky-sport  experiences  contact
paper · paper · paper  · NIGHT     · NIGHT      · paper    · paper      · NIGHT
```

— it **oscillates** light -> dark -> light -> dark. A strictly monotonic
"altitude gauge" cannot honestly narrate an oscillating sequence: it would claim
the sky keeps getting higher/darker while the backgrounds visibly return to
daylight in the middle.

Two concrete defects followed from the unresolved framing:

1. **Code/doc disagreement.** `src/lib/altitude.ts` ordered the stops
   `GROUND -> HAZE -> ALTITUDE -> CLEAR -> NIGHT`, while every document (ADR-0006,
   `navigation-altitude-gauge.md`) said `... CLEAR -> ALTITUDE ...`. `CLEAR` and
   `ALTITUDE` were swapped, so the gauge would mislabel sections.
2. **Physical incoherence.** Under the old labels, "CLEAR" sat _above_ "ALTITUDE"
   yet mapped to a section whose background gets _lighter_ — the opposite of how a
   sky behaves with height.

## Decision Drivers

1. **Honesty of metaphor** — the device must match what the page actually does.
2. **Preserve the intended intermittency** — keep light/dark alternation; it is a
   requirement, not an accident.
3. **Single source of truth** — bands defined once in `src/lib/altitude.ts`,
   anchored to the existing section targets, so the gauge cannot drift from scroll.
4. **Minimal blast radius** — section order and anchors stay; only band
   vocabulary changes.

## Considered Options

### Option A: Reframe as a flight profile (CHOSEN)

It is a **flight**, not a pure climb. A real flight's altitude rises and falls,
and crucially the sky _above the cloud deck is dark even by day_. The bands become
flight phases anchored to the unchanged section targets:

| Band      | Tone         | Anchored section | Meaning                                    |
| --------- | ------------ | ---------------- | ------------------------------------------ |
| `ground`  | paper        | `hero`           | On the ground — taxi and takeoff.          |
| `climb`   | paper->night | `mosaic`         | Climbing into cloud; the crossfade begins. |
| `cruise`  | night        | `ai-physics`     | Above the clouds — dark sky, serious core. |
| `descent` | night->paper | `sky-sport`      | Breaking back into daylight below cloud.   |
| `night`   | night        | `contact`        | Night landing, starlit.                    |

Gauge labels: `GROUND -> CLIMB -> CRUISE -> DESCENT -> NIGHT`. The oscillation is
now intentional and physically true, and the `CLEAR`/`ALTITUDE` swap disappears
because those names are gone.

### Option B: True single day-to-night climb

Reorder sections so tone only darkens once. Rejected: forces content reordering
(the recruiter-facing AI core would have to move) and discards the intermittency
the brief explicitly asked for.

### Option C: Demote the gauge to abstract progress

Keep per-section tone as "mood" and make the gauge a neutral progress bar.
Rejected: cheapest, but it surrenders the signature — the navigation stops being
the metaphor.

## Decision

Adopt the **flight profile**. Bands are `ground / climb / cruise / descent /
night`, defined once in `src/lib/altitude.ts` and typed in `src/types/domain.ts`.
The altitude gauge represents a flight-altitude profile that may rise and fall
(its full scroll-linked rendering remains roadmap Phase 3, per ADR-0006). Tone
backgrounds remain the binary `paper` / `night` of ADR-0008; this ADR changes only
how the bands between them are named and narrated.

ADR-0001 and ADR-0006 remain valid for everything except the monotonic-climb
language and the old band names, which this ADR supersedes.

## Consequences

- **Positive:** the metaphor now matches the page; the code/doc swap is resolved;
  the intended light/dark intermittency gains a true-to-life justification.
- **Negative:** documentation across `docs/architecture/` and `docs/design-system/`
  must be re-synced to the new vocabulary (done with this ADR).
- **Follow-up:** the full flight-profile gauge (rise-and-fall fill, upward-reveal
  top bar, mobile collapse) stays Phase 3; section order is unchanged in
  `docs/architecture/page-architecture.md`.
