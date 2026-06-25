# Page Architecture — the Puzzle, Top-Down = the Flight Profile

> Decision records: [ADR-0001](../adr/0001-single-page-ascent-architecture.md),
> reframed by [ADR-0010](../adr/0010-flight-profile-tonal-bands.md).

The vertical order of the page _is_ the flight. Top is the human ground; the
professional core sits at cruise — above the cloud deck, where the sky is dark
even by day — reached immediately by a recruiter; the descent breaks back into
daylight for sport and experiences before the night landing.

```
00 · HERO         — the thesis: name + one-line manifesto        [PAPER  · ground]
01 · WHO          — character: enterprising, adventurous, curious [PAPER  · ground]
02 · THE MOSAIC   — the puzzle index; tiles open into case studies[PAPER -> NIGHT · climb]
03 · AI & PHYSICS — the serious core for a recruiter              [NIGHT  · cruise]
04 · WORK & SCHOOL— projects, each enlarges                       [NIGHT  · cruise]
05 · SKY & SPORT  — aviation/VDS, tennis, MTB; very visual        [NIGHT -> PAPER · descent]
06 · EXPERIENCES  — curated storytelling -> archive on "dig deeper"[PAPER  · descent]
07 · CONTACT      — one clear invitation                          [NIGHT  · night landing]
```

## How the puzzle works

- **The Mosaic (02)** is the visual index: modular tiles, distinct yet cohesive
  (same typography, same orange thread). It is the promise of "pieces under one
  roof".
- Each tile is a curated teaser on the surface; clicking enlarges it into a long,
  detailed case study (a dedicated route — see
  [ADR-0005](../adr/0005-case-studies-as-mdx-routes.md)).
- Top-down order coincides with the flight: human ground first, then the
  professional cruise (the serious part a recruiter sees, above the clouds), then
  daylight again on the descent for sport and experiences, then the night landing.

## Implementation map

| Section          | Component                      | Flight band | Tone          | Transitions via           |
| ---------------- | ------------------------------ | ----------- | ------------- | ------------------------- |
| 00 Hero          | `src/sections/Hero.tsx`        | ground      | paper         | —                         |
| 01 Who           | `src/sections/Who.tsx`         | ground      | paper         | —                         |
| 02 Mosaic        | `src/sections/Mosaic.tsx`      | climb       | paper → night | `TonalScene` (Phase 2)    |
| 03 AI & Physics  | `src/sections/AiPhysics.tsx`   | cruise      | night         | `TonalScene` (Phase 2)    |
| 04 Work & School | `src/sections/WorkSchool.tsx`  | cruise      | night         | — (solid)                 |
| 05 Sky & Sport   | `src/sections/SkySport.tsx`    | descent     | night → paper | GSAP engine (**Phase 3**) |
| 06 Experiences   | `src/sections/Experiences.tsx` | descent     | paper         | — (solid)                 |
| 07 Contact       | `src/sections/Contact.tsx`     | night       | night         | — (solid)                 |

> **Status:** The climb crossfade (paper → night) is live via `TonalScene` wrapping
> sections 00–03. The descent crossfade (night → paper) and the full multi-band GSAP
> engine are roadmap Phase 3 (see ADR-0003, ADR-0010).

Section order and bands are encoded in `src/lib/altitude.ts`
(`SECTION_ORDER`, `ALTITUDE_STOPS`). Flight-profile vocabulary per ADR-0010.
