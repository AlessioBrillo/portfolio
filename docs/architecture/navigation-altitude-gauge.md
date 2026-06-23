# Navigation — the Altitude Gauge

> Decision records: [ADR-0006](../adr/0006-navigation-altitude-gauge.md),
> reframed by [ADR-0010](../adr/0010-flight-profile-tonal-bands.md).

In a long single page the user must always know "where am I" and be able to jump.
Instead of a generic menu, the navigation _is_ the metaphor: an altitude
indicator that tracks the flight profile (it rises and falls, see ADR-0010).

- A thin fixed vertical bar (desktop, right side) tracks the flight. Beside it, a
  mono label of the current band: `GROUND -> CLIMB -> CRUISE -> DESCENT -> NIGHT`.
- Each label is clickable -> smooth-scroll to the band. Navigation and
  storytelling in one.
- A minimal top bar (name left, `Contact` right) appears only on upward scroll and
  hides on the way down, to preserve immersion.
- Orange marks the current position on the gauge — the one place the accent
  indicates something functional.

## Decision

No hamburger, no classic menu. The gauge is the signature of the navigation too.

## Component map

| Element        | Component                                     | Scaffold state                                                                                                                             |
| -------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Vertical gauge | `src/components/navigation/AltitudeGauge.tsx` | Wired to real scroll progress; active band highlighted; labels scroll to sections. Full fill animation + mobile collapse: roadmap Phase 3. |
| Top bar        | `src/components/navigation/TopBar.tsx`        | Static structure; the upward-reveal/hide behaviour is roadmap Phase 3.                                                                     |

Stops are defined once in `src/lib/altitude.ts` (`ALTITUDE_STOPS`).
