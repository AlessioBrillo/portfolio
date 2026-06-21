# Page Architecture — the Puzzle, Top-Down = Ground to Night

> Decision record: [ADR-0001](../adr/0001-single-page-ascent-architecture.md).

The vertical order of the page _is_ the ascent. Top is the human ground; the
professional altitude sits high and deep (reached immediately by a recruiter);
light returns for sport and experiences further down.

```
00 · HERO         — the thesis: name + one-line manifesto        [PAPER  · ground/day]
01 · WHO          — character: enterprising, adventurous, curious [PAPER]
02 · THE MOSAIC   — the puzzle index; tiles open into case studies[PAPER -> HAZE]
03 · AI & PHYSICS — the serious core for a recruiter              [NIGHT  · altitude]
04 · WORK & SCHOOL— projects, each enlarges                       [NIGHT]
05 · SKY & SPORT  — aviation/VDS, tennis, MTB; very visual        [PAPER  · light returns]
06 · EXPERIENCES  — curated storytelling -> archive on "dig deeper"[PAPER]
07 · CONTACT      — one clear invitation                          [NIGHT  · starlit]
```

## How the puzzle works

- **The Mosaic (02)** is the visual index: modular tiles, distinct yet cohesive
  (same typography, same orange thread). It is the promise of "pieces under one
  roof".
- Each tile is a curated teaser on the surface; clicking enlarges it into a long,
  detailed case study (a dedicated route — see
  [ADR-0005](../adr/0005-case-studies-as-mdx-routes.md)).
- Top-down order coincides with the ascent: human ground first, then the
  professional altitude (the serious part a recruiter sees), then light again for
  sport and experiences.

## Implementation map

| Section          | Component                      | Band tone |
| ---------------- | ------------------------------ | --------- |
| 00 Hero          | `src/sections/Hero.tsx`        | paper     |
| 01 Who           | `src/sections/Who.tsx`         | paper     |
| 02 Mosaic        | `src/sections/Mosaic.tsx`      | paper     |
| 03 AI & Physics  | `src/sections/AiPhysics.tsx`   | night     |
| 04 Work & School | `src/sections/WorkSchool.tsx`  | night     |
| 05 Sky & Sport   | `src/sections/SkySport.tsx`    | paper     |
| 06 Experiences   | `src/sections/Experiences.tsx` | paper     |
| 07 Contact       | `src/sections/Contact.tsx`     | night     |

Section order and tones are also encoded in `src/lib/altitude.ts`
(`SECTION_ORDER`, `ALTITUDE_STOPS`).
